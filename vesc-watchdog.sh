#!/bin/bash
# VESC Watchdog v2.1 - Role-specific reminders + Crash Recovery + Stuck Input Detection
#
# Usage:
#   ./vesc-watchdog.sh start    - Start watchdog daemon
#   ./vesc-watchdog.sh stop     - Stop watchdog
#   ./vesc-watchdog.sh status   - Show status
#   ./vesc-watchdog.sh restart <instance>  - Manually restart an instance
#   ./vesc-watchdog.sh unstick <instance>  - Push Enter on stuck instance
#
# Monitors: claude-8, claude-9, claude-10
# Interval: 10 minutes
# Features:
#   - Role-specific reminders
#   - Crash detection and auto-recovery
#   - Starter prompts with full context
#   - Stuck input detection (alerts Telegram + injects to claude-0)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
PID_FILE="$SCRIPT_DIR/.vesc-watchdog.pid"
LOG_FILE="$SCRIPT_DIR/logs/vesc-watchdog.log"
INJECT_SCRIPT="$HOME/.claude/telegram-orchestrator/inject-prompt.sh"
SEND_SUMMARY="$HOME/.claude/telegram-orchestrator/send-summary.sh"
INTERVAL=300  # 5 minutes (faster detection)

# Instances to watch
INSTANCES=("claude-8" "claude-9" "claude-10")

# Reminder rotation counter (persisted)
COUNTER_FILE="$SCRIPT_DIR/.vesc-watchdog-counter"

# Crash tracking
CRASH_COUNT_FILE="$SCRIPT_DIR/.vesc-crash-counts"

# Stuck input tracking (timestamp when first detected)
STUCK_INPUT_FILE="$SCRIPT_DIR/.vesc-stuck-input"
STUCK_THRESHOLD=120  # 2 minutes before alerting

# Stale busy tracking - if "busy" too long without change, something is wrong
STALE_BUSY_FILE="$SCRIPT_DIR/.vesc-stale-busy"
STALE_BUSY_THRESHOLD=1200  # 20 minutes of continuous "busy" = suspicious

mkdir -p "$SCRIPT_DIR/logs"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo "[$(date '+%H:%M:%S')] $1"
}

get_counter() {
    if [[ -f "$COUNTER_FILE" ]]; then
        cat "$COUNTER_FILE"
    else
        echo "0"
    fi
}

increment_counter() {
    local count=$(get_counter)
    echo $((count + 1)) > "$COUNTER_FILE"
}

# Track crash counts per instance
get_crash_count() {
    local instance=$1
    if [[ -f "$CRASH_COUNT_FILE" ]]; then
        grep "^$instance:" "$CRASH_COUNT_FILE" 2>/dev/null | cut -d: -f2 || echo "0"
    else
        echo "0"
    fi
}

increment_crash_count() {
    local instance=$1
    local count=$(get_crash_count "$instance")
    local new_count=$((count + 1))

    if [[ -f "$CRASH_COUNT_FILE" ]]; then
        grep -v "^$instance:" "$CRASH_COUNT_FILE" > "$CRASH_COUNT_FILE.tmp" 2>/dev/null || true
        mv "$CRASH_COUNT_FILE.tmp" "$CRASH_COUNT_FILE"
    fi
    echo "$instance:$new_count" >> "$CRASH_COUNT_FILE"
    echo "$new_count"
}

# ============================================================================
# STUCK INPUT DETECTION
# ============================================================================

# Get stuck input text from pane (if any)
get_stuck_input() {
    local instance=$1
    local content=$(tmux capture-pane -t "$instance" -p 2>/dev/null)

    # If we see "↵ send" at bottom, there's unsent input
    if echo "$content" | tail -3 | grep -q "↵ send"; then
        # Extract the input line (usually above "↵ send" line)
        # Look for lines that look like user input (non-system lines)
        local input_line=$(echo "$content" | tail -10 | grep -v "↵ send" | grep -v "bypass permissions" | grep -v "^[│├└─]" | tail -1)
        if [[ -n "$input_line" ]]; then
            echo "$input_line"
        else
            echo "[input detected but couldn't extract]"
        fi
    fi
}

# Track when stuck input was first detected
get_stuck_since() {
    local instance=$1
    if [[ -f "$STUCK_INPUT_FILE" ]]; then
        grep "^$instance:" "$STUCK_INPUT_FILE" 2>/dev/null | cut -d: -f2
    fi
}

set_stuck_since() {
    local instance=$1
    local timestamp=$2

    if [[ -f "$STUCK_INPUT_FILE" ]]; then
        grep -v "^$instance:" "$STUCK_INPUT_FILE" > "$STUCK_INPUT_FILE.tmp" 2>/dev/null || true
        mv "$STUCK_INPUT_FILE.tmp" "$STUCK_INPUT_FILE"
    fi
    echo "$instance:$timestamp" >> "$STUCK_INPUT_FILE"
}

clear_stuck_since() {
    local instance=$1
    if [[ -f "$STUCK_INPUT_FILE" ]]; then
        grep -v "^$instance:" "$STUCK_INPUT_FILE" > "$STUCK_INPUT_FILE.tmp" 2>/dev/null || true
        mv "$STUCK_INPUT_FILE.tmp" "$STUCK_INPUT_FILE"
    fi
}

# Handle stuck input - alert Telegram + inject to claude-0
handle_stuck_input() {
    local instance=$1
    local stuck_text=$2
    local stuck_duration=$3

    log "⚠️ STUCK INPUT DETECTED: $instance for ${stuck_duration}s"

    # Truncate long text for display
    local display_text="${stuck_text:0:200}"
    if [[ ${#stuck_text} -gt 200 ]]; then
        display_text="${display_text}..."
    fi

    # Send Telegram alert
    "$SEND_SUMMARY" --session vesc-watchdog "⚠️ <b>Stuck Input Alert: $instance</b>

🕐 <b>Stuck for:</b> ${stuck_duration} seconds
📝 <b>Input text:</b>
<code>${display_text}</code>

💡 <i>Options:</i>
• Reply 'unstick $instance' to push Enter
• Reply 'clear $instance' to discard input
• Or manually check the session"

    # Inject to claude-0 for manual resolution
    local c0_prompt="⚠️ STUCK INPUT ALERT: $instance has had unsent input for ${stuck_duration}s

**Stuck text:** \`${display_text}\`

**Your options:**
1. Check the instance: \`tmux capture-pane -t $instance -p | tail -20\`
2. Push Enter if safe: \`tmux send-keys -t $instance Enter\`
3. Clear the input: \`tmux send-keys -t $instance C-u\`
4. Do nothing and let user decide

Please investigate and take appropriate action, then report what you did."

    # Only inject to claude-0 if it exists and is idle
    if session_exists "claude-0" && is_idle "claude-0"; then
        log "Injecting stuck alert to claude-0"
        "$INJECT_SCRIPT" "claude-0" "$c0_prompt"
    else
        log "claude-0 not available for injection (missing or busy)"
    fi
}

# Push Enter on stuck instance
unstick_instance() {
    local instance=$1
    log "Pushing Enter on $instance to unstick"
    tmux send-keys -t "$instance" Enter
    sleep 1
    # Clear the stuck tracking
    clear_stuck_since "$instance"
    log "✅ Pushed Enter on $instance"
}

# Clear input on stuck instance
clear_instance_input() {
    local instance=$1
    log "Clearing input on $instance"
    tmux send-keys -t "$instance" C-u
    sleep 0.5
    clear_stuck_since "$instance"
    log "✅ Cleared input on $instance"
}

# ============================================================================
# STALE BUSY DETECTION
# ============================================================================

# Get content hash to detect if output changed
get_content_hash() {
    local instance=$1
    tmux capture-pane -t "$instance" -p 2>/dev/null | tail -20 | md5 -q 2>/dev/null || echo "unknown"
}

# Track when instance became "busy" and its content hash
get_busy_since() {
    local instance=$1
    if [[ -f "$STALE_BUSY_FILE" ]]; then
        grep "^$instance:" "$STALE_BUSY_FILE" 2>/dev/null | cut -d: -f2
    fi
}

get_busy_hash() {
    local instance=$1
    if [[ -f "$STALE_BUSY_FILE" ]]; then
        grep "^$instance:" "$STALE_BUSY_FILE" 2>/dev/null | cut -d: -f3
    fi
}

set_busy_since() {
    local instance=$1
    local timestamp=$2
    local hash=$3

    if [[ -f "$STALE_BUSY_FILE" ]]; then
        grep -v "^$instance:" "$STALE_BUSY_FILE" > "$STALE_BUSY_FILE.tmp" 2>/dev/null || true
        mv "$STALE_BUSY_FILE.tmp" "$STALE_BUSY_FILE"
    fi
    echo "$instance:$timestamp:$hash" >> "$STALE_BUSY_FILE"
}

clear_busy_since() {
    local instance=$1
    if [[ -f "$STALE_BUSY_FILE" ]]; then
        grep -v "^$instance:" "$STALE_BUSY_FILE" > "$STALE_BUSY_FILE.tmp" 2>/dev/null || true
        mv "$STALE_BUSY_FILE.tmp" "$STALE_BUSY_FILE"
    fi
}

# Handle stale busy - instance claims busy but no progress
handle_stale_busy() {
    local instance=$1
    local stale_duration=$2

    log "🚨 STALE BUSY DETECTED: $instance for ${stale_duration}s with no progress!"

    # Capture current state for diagnosis
    local pane_content=$(tmux capture-pane -t "$instance" -p | tail -15)

    # Send Telegram alert
    "$SEND_SUMMARY" --session vesc-watchdog "🚨 <b>STALE AGENT: $instance</b>

⏰ <b>No progress for:</b> $((stale_duration / 60)) minutes
🔍 <b>Claims:</b> Busy but output hasn't changed

📝 <b>Current screen:</b>
<code>${pane_content:0:300}</code>

⚠️ <i>Likely frozen or stuck. Consider restart.</i>
• Reply 'restart $instance' to force restart"

    # Inject to claude-0 for investigation
    local c0_prompt="🚨 STALE BUSY ALERT: $instance has been 'busy' for $((stale_duration / 60)) minutes with NO OUTPUT CHANGE!

**This means:** The agent is likely frozen, not actually working.

**Current screen (last 15 lines):**
\`\`\`
${pane_content:0:400}
\`\`\`

**Recommended action:** Force restart with:
\`\`\`bash
cd ~/work/gergo/vesc/vesc_it && ./vesc-watchdog.sh restart $instance
\`\`\`

Please investigate and restart if needed."

    if session_exists "claude-0" && is_idle "claude-0"; then
        log "Injecting stale alert to claude-0"
        "$INJECT_SCRIPT" "claude-0" "$c0_prompt"
    fi
}

# ============================================================================
# HEALTH CHECKS
# ============================================================================

# Check if tmux session exists
session_exists() {
    tmux has-session -t "$1" 2>/dev/null
}

# Check if Claude is actually running inside the session (not exited)
is_claude_alive() {
    local instance=$1

    if ! session_exists "$instance"; then
        return 1
    fi

    # Capture the pane content
    local content=$(tmux capture-pane -t "$instance" -p 2>/dev/null)

    # If we see these patterns, Claude is alive
    if echo "$content" | grep -qE "(bypass permissions|esc to interrupt|thinking|Percolating|Leavening|Misting|Reasoning)"; then
        return 0
    fi

    # If we see shell prompt without Claude, it crashed
    if echo "$content" | tail -5 | grep -qE "^\$ $|^% $|^❯ $"; then
        # Check if it's just a shell prompt (Claude exited)
        if ! echo "$content" | grep -q "bypass permissions"; then
            return 1
        fi
    fi

    # If pane is empty or has error, assume crashed
    if [[ -z "$content" ]] || echo "$content" | grep -qE "(exited|error|Error|crashed)"; then
        return 1
    fi

    return 0
}

# Check if instance is actively thinking (showing spinner)
is_thinking() {
    local instance=$1
    local content=$(tmux capture-pane -t "$instance" -p 2>/dev/null)
    # Look for thinking indicators anywhere in last 10 lines
    echo "$content" | tail -10 | grep -qE "(esc to interrupt|Sautéed|Pollinating|Transfiguring|Churning|Percolating|Leavening|Misting|Reasoning|Crunched|thinking)"
}

# Check if instance is idle (shows "bypass permissions" and NOT thinking)
is_idle() {
    local instance=$1
    local content=$(tmux capture-pane -t "$instance" -p 2>/dev/null)

    # Must have "bypass permissions" somewhere in last 6 lines
    if ! echo "$content" | tail -6 | grep -q "bypass permissions"; then
        return 1
    fi

    # Must NOT be actively thinking
    if is_thinking "$instance"; then
        return 1
    fi

    return 0
}

# Check if instance has stuck input (unsent text in input field)
has_stuck_input() {
    local instance=$1
    local content=$(tmux capture-pane -t "$instance" -p 2>/dev/null)
    echo "$content" | tail -3 | grep -q "↵ send"
}

# Full health check
check_health() {
    local instance=$1

    if ! session_exists "$instance"; then
        echo "SESSION_MISSING"
    elif ! is_claude_alive "$instance"; then
        echo "CLAUDE_CRASHED"
    elif has_stuck_input "$instance"; then
        echo "HAS_STUCK_INPUT"
    elif is_idle "$instance"; then
        echo "HEALTHY_IDLE"
    else
        echo "HEALTHY_BUSY"
    fi
}

# ============================================================================
# STARTER PROMPTS (for crash recovery)
# ============================================================================

get_starter_prompt_claude8() {
    cat << 'STARTER'
🔄 SESSION RECOVERED - You are claude-8, INFRASTRUCTURE LEAD for VESC_IT

## Your Role
You are the ENGINEER. You build the technical foundation, NOT documentation.

## What You Own
- Supabase project + pgvector setup
- Embedding pipeline (chunking, vectorization)
- Next.js chat interface on Vercel
- n8n automation on Hostinger VPS
- API integrations (OpenAI, Supabase)

## What You DON'T Own
- Knowledge base content (claude-9 writes that)
- User question research (claude-10 does that)

## IMMEDIATE RECOVERY STEPS
1. Check where we are:
   ```bash
   pwd
   cd ~/work/gergo/vesc/vesc_it
   ```

2. Read YOUR personal context (most important!):
   ```bash
   cat agents/claude-8.md
   ```

3. Read your role definition:
   ```bash
   cat CLAUDE.md | grep -A 60 'Claude-8'
   ```

4. Check progress - what was done:
   ```bash
   cat PROGRESS.md
   ```

5. Check git status and infrastructure:
   ```bash
   git status
   ls -la src/ 2>/dev/null || echo "No src/ yet"
   ```

## After Recovery
- UPDATE agents/claude-8.md with your current state
- Send Telegram report about your status
- Continue from where your context file shows

## Communication
```bash
# Need content from claude-9
~/.claude/telegram-orchestrator/inject-prompt.sh claude-9 "CONTENT REQUEST: Need docs on [topic]"

# Ready for testing
~/.claude/telegram-orchestrator/inject-prompt.sh claude-10 "READY FOR TEST: [component] ready"
```

⛔ REMEMBER: Nothing is DONE until claude-10 tests it!

Start by running the recovery steps above, then send a Telegram report.
<tg>send-summary.sh</tg>
STARTER
}

get_starter_prompt_claude9() {
    cat << 'STARTER'
🔄 SESSION RECOVERED - You are claude-9, KNOWLEDGE ARCHITECT for VESC_IT

## Your Role
You are the EXPERT. You WRITE comprehensive documentation, not just review.

## What You Own
- Deep-dive documentation for ALL 6 VESC repos
- Technical accuracy of knowledge base content
- Content structure optimized for RAG retrieval
- Maintain knowledge-base/ and docs/ directories

## Repo Ownership (WRITE content for each)
- bldc/ → FOC algorithms, fault codes, motor parameters
- vesc_tool/ → Wizards, settings, configuration
- vesc_pkg/ → LispBM, packages, extensions
- vesc_express/ → ESP32, BLE/WiFi setup
- vesc_bms_fw/ → BMS, cell balancing
- refloat/ → Balance tuning, tiltback, safety

## IMMEDIATE RECOVERY STEPS
1. Check where we are:
   ```bash
   pwd
   cd ~/work/gergo/vesc/vesc_it
   ```

2. Read YOUR personal context (most important!):
   ```bash
   cat agents/claude-9.md
   ```

3. Read your role definition:
   ```bash
   cat CLAUDE.md | grep -A 60 'Claude-9'
   ```

4. Check progress - what was done:
   ```bash
   cat PROGRESS.md
   ```

5. Check existing content and sibling repos:
   ```bash
   ls -la knowledge-base/ docs/
   ls -la ../
   ```

## After Recovery
- UPDATE agents/claude-9.md with your current state
- Send Telegram report about your status
- Continue from where your context file shows

## Communication
```bash
# Content ready for embedding
~/.claude/telegram-orchestrator/inject-prompt.sh claude-8 "CONTENT READY: knowledge-base/[file].md ready"

# Need priorities
~/.claude/telegram-orchestrator/inject-prompt.sh claude-10 "PRIORITY REQUEST: What topics should I write?"
```

⛔ REMEMBER: Your content must pass claude-10's tests!

Start by running the recovery steps above, then send a Telegram report.
<tg>send-summary.sh</tg>
STARTER
}

get_starter_prompt_claude10() {
    cat << 'STARTER'
🔄 SESSION RECOVERED - You are claude-10, USER ADVOCATE & GATEKEEPER for VESC_IT

## Your Role
You are the VOICE OF USERS and the QUALITY GATE. Nothing is "done" until you approve it.

## What You Own
- Real user question mining (forums, Reddit, Discord, GitHub issues)
- Question categorization and prioritization
- Test suite creation with expected answers
- End-to-end testing and approval
- qa/ directory maintenance
- Wake-up summary for Gergő

## YOUR POWER
⛔ NOTHING is complete until YOU test and approve it!
- claude-8 cannot ship without your approval
- claude-9's content must answer real questions
- You can BLOCK progress if tests fail

## IMMEDIATE RECOVERY STEPS
1. Check where we are:
   ```bash
   pwd
   cd ~/work/gergo/vesc/vesc_it
   ```

2. Read YOUR personal context (most important!):
   ```bash
   cat agents/claude-10.md
   ```

3. Read your role and Testing Gate rules:
   ```bash
   cat CLAUDE.md | grep -A 60 'Claude-10'
   cat CLAUDE.md | grep -A 40 'Testing Gate'
   ```

4. Check progress and QA status:
   ```bash
   cat PROGRESS.md
   ls -la qa/
   cat qa/TESTING.md 2>/dev/null || echo "TESTING.md not created yet!"
   ```

## Critical Deliverables
- qa/TESTING.md - "What can Gergő test right now?"
- qa/test-suite.md - Questions with expected answers
- qa/test-results.md - Pass/fail log

## After Recovery
- UPDATE agents/claude-10.md with your current state
- Send Telegram report about your status
- Continue from where your context file shows

## Communication
```bash
# Send priorities to claude-9
~/.claude/telegram-orchestrator/inject-prompt.sh claude-9 "PRIORITY TOPICS: 1. X, 2. Y, 3. Z"

# Block on failed tests
~/.claude/telegram-orchestrator/inject-prompt.sh claude-8 "TEST FAILED: [component] - [issue]. FIX before proceeding!"

# Approve completed work
~/.claude/telegram-orchestrator/inject-prompt.sh claude-8 "TEST PASSED: [component] approved. Proceed."
```

🌅 WAKE-UP SUMMARY: Gergő will wake up soon. Make sure qa/TESTING.md is ready!

Start by running the recovery steps above, then send a Telegram report.
<tg>send-summary.sh</tg>
STARTER
}

get_starter_prompt() {
    local instance=$1
    case "$instance" in
        claude-8) get_starter_prompt_claude8 ;;
        claude-9) get_starter_prompt_claude9 ;;
        claude-10) get_starter_prompt_claude10 ;;
        *) echo "Unknown instance: $instance" ;;
    esac
}

# ============================================================================
# CRASH RECOVERY
# ============================================================================

restart_instance() {
    local instance=$1
    local crash_count=$(increment_crash_count "$instance")

    log "🔄 RESTARTING $instance (crash #$crash_count)"

    # Kill existing session if it exists
    if session_exists "$instance"; then
        log "Killing existing session $instance"
        tmux kill-session -t "$instance" 2>/dev/null || true
        sleep 1
    fi

    # Create new session with Claude
    log "Creating new session for $instance"
    cd "$PROJECT_DIR"
    tmux new-session -d -s "$instance" -c "$PROJECT_DIR" "claude --dangerously-skip-permissions"

    # Wait for Claude to initialize
    sleep 5

    # Verify it started
    if ! session_exists "$instance"; then
        log "❌ Failed to create session for $instance"
        return 1
    fi

    # Wait a bit more for Claude to be ready
    sleep 3

    # Inject starter prompt
    local starter_prompt=$(get_starter_prompt "$instance")
    log "Injecting starter prompt to $instance"
    "$INJECT_SCRIPT" "$instance" "$starter_prompt"

    # Send Telegram notification about recovery
    "$SEND_SUMMARY" --session claude-0 "🔄 <b>Auto-Recovery: $instance</b>

⚠️ <b>Crash detected and recovered</b>
• Instance: $instance
• Crash count: $crash_count
• Status: Restarted with full context

📋 <b>Recovery prompt injected:</b>
• Role reminder
• Project folder guidance
• PROGRESS.md check instructions
• Communication protocols

💡 <i>Agent should send status report shortly</i>"

    log "✅ $instance restarted successfully"
    return 0
}

# ============================================================================
# ROLE-SPECIFIC REMINDERS
# ============================================================================

get_claude8_reminder() {
    local idx=$1
    local reminders=(
        "🔧 INFRASTRUCTURE CHECK: What's your Supabase status? If not created yet, do it NOW. Don't wait for perfect docs - use what exists in knowledge-base/."

        "⚡ ACTIVE BUILDING: You're the engineer. Build something concrete in the next 10 minutes. Embedding pipeline? Chat UI? n8n workflow? Pick one, make progress."

        "🔗 INTEGRATION FOCUS: Your job is to connect pieces, not write content. Need docs? Ask claude-9. Have something testable? Tell claude-10."

        "📦 DEPLOYMENT CHECK: What can you deploy RIGHT NOW? Even a basic Next.js skeleton on Vercel shows progress. Ship early, iterate often."

        "🎯 ROLE REMINDER: You own INFRASTRUCTURE (Supabase, Vercel, n8n, embeddings). Claude-9 owns CONTENT. Claude-10 owns TESTING. Stay in your lane, move fast."

        "💬 COMMUNICATION CHECK: When did you last message your teammates? If you need content, inject to claude-9. If ready for testing, inject to claude-10."

        "⛔ TESTING GATE: Nothing is DONE until claude-10 tests it! When you finish a component, notify claude-10 immediately. Don't proceed until they approve."

        "🌅 WAKE-UP READY: Gergő will wake up and want to test. Is your component ready? Can they run a simple test? Make it easy for them."

        "📢 UPDATE CHECK: Did you update all THREE? 1) PROGRESS.md with timestamp 2) agents/claude-8.md with current state 3) TTS + Telegram for Gergő. Do it NOW if not!"
    )
    echo "${reminders[$((idx % ${#reminders[@]}))]}"
}

get_claude9_reminder() {
    local idx=$1
    local reminders=(
        "📚 CONTENT CREATION: You're not just a reviewer - you're the WRITER. What documentation are you actively creating right now? Pick a VESC repo and deep-dive."

        "🎯 PRIORITY CHECK: Has claude-10 sent you topic priorities? If not, ask them! If yes, are you working on the highest priority topics?"

        "✍️ ACTIVE WRITING: Write 500 words in the next 10 minutes. Pick: bldc/ FOC explanation, refloat/ tuning guide, vesc_tool/ wizard walkthrough. GO."

        "🔍 SOURCE VERIFICATION: Every claim needs a source. Open a sibling repo (../bldc, ../refloat) and extract REAL code examples and parameters."

        "📤 OUTPUT CHECK: When did you last notify claude-8 that content is ready? They need your docs to embed. Push content, don't hoard it."

        "🧠 EMBEDDING-FRIENDLY: Write for RAG retrieval. Clear headers, self-contained sections, 500-1000 token chunks. Think: 'How will this be retrieved?'"

        "⛔ TESTING GATE: Your content must pass claude-10's tests before it's 'done'. Does your writing actually answer real user questions?"

        "🌅 WAKE-UP READY: Gergő will read your docs tomorrow. Are they clear enough for a human? Not just technically correct - actually helpful?"

        "📢 UPDATE CHECK: Did you update all THREE? 1) PROGRESS.md with timestamp 2) agents/claude-9.md with current state 3) TTS + Telegram for Gergő. Do it NOW if not!"
    )
    echo "${reminders[$((idx % ${#reminders[@]}))]}"
}

get_claude10_reminder() {
    local idx=$1
    local reminders=(
        "🔎 QUESTION MINING: Have you searched VESC forums today? Reddit? GitHub issues? Find 10 REAL user questions in the next 10 minutes."

        "📊 PRIORITIZATION: What are the TOP 5 topics users struggle with? Tell claude-9 so they know what to write. Your research drives their priorities."

        "👤 USER VOICE: You represent beginners, intermediates, AND experts. What would a confused newbie ask? What would an expert need to know?"

        "📝 TEST SUITE: Have you created qa/test-suite.md? Write 20 questions with expected answers. This is YOUR primary deliverable."

        "🔗 FEEDBACK LOOP: When did you last message claude-9 with priorities or claude-8 asking about testing? You're the bridge between users and the system."

        "🌐 SOURCE DIVERSITY: Check vesc-project.com/forum, r/ElectricSkateboarding, r/onewheel. Different communities = different questions."

        "⛔ YOU ARE THE GATE: Nothing is 'done' until YOU approve it. Test everything claude-8 builds. Verify claude-9's content answers real questions. Be strict!"

        "🌅 WAKE-UP SUMMARY: Gergő will wake up soon. Is qa/TESTING.md ready? Does it clearly show what he can test? This is YOUR responsibility!"

        "✅ TESTING.md CHECK: Update qa/TESTING.md NOW with: What's ready to test, what's not ready, last test results. Make it dead simple for a human."

        "🚫 BLOCK IF NEEDED: If something fails testing, inject to claude-8/claude-9 IMMEDIATELY. They cannot proceed until you approve. Use your power!"

        "📢 UPDATE CHECK: Did you update all THREE? 1) PROGRESS.md with timestamp 2) agents/claude-10.md with current state 3) TTS + Telegram for Gergő. Do it NOW if not!"
    )
    echo "${reminders[$((idx % ${#reminders[@]}))]}"
}

# ============================================================================
# COLLABORATION FOOTERS (added to every reminder)
# ============================================================================

get_collab_footer_claude8() {
    cat << 'COLLAB'

🤝 **TEAM CHECK** - Don't work in isolation!
• Need docs? → `inject-prompt.sh claude-9 "CONTENT REQUEST: [topic]"`
• Ready for test? → `inject-prompt.sh claude-10 "READY FOR TEST: [component]"`
• Blocked? → `inject-prompt.sh claude-0 "BLOCKED: [issue]"`
COLLAB
}

get_collab_footer_claude9() {
    cat << 'COLLAB'

🤝 **TEAM CHECK** - Don't work in isolation!
• What should I write? → `inject-prompt.sh claude-10 "PRIORITY REQUEST: What topics?"`
• Content ready? → `inject-prompt.sh claude-8 "CONTENT READY: [file] for embedding"`
• Found issues? → `inject-prompt.sh claude-8 "CORRECTION: [what's wrong]"`
COLLAB
}

get_collab_footer_claude10() {
    cat << 'COLLAB'

🤝 **TEAM CHECK** - You drive the team!
• Set priorities → `inject-prompt.sh claude-9 "PRIORITY TOPICS: 1. X, 2. Y, 3. Z"`
• Test failed? → `inject-prompt.sh claude-8 "TEST FAILED: [issue] - FIX NOW"`
• Test passed? → `inject-prompt.sh claude-8 "TEST PASSED: [component] approved"`
COLLAB
}

get_collab_footer() {
    local instance=$1
    case "$instance" in
        claude-8) get_collab_footer_claude8 ;;
        claude-9) get_collab_footer_claude9 ;;
        claude-10) get_collab_footer_claude10 ;;
    esac
}

# ============================================================================
# REMINDER INJECTION
# ============================================================================

inject_reminder() {
    local instance=$1
    local reminder=$2

    if ! is_idle "$instance"; then
        log "$instance is busy (thinking), skipping reminder"
        return 0
    fi

    local collab_footer=$(get_collab_footer "$instance")

    log "Injecting reminder to $instance"
    "$INJECT_SCRIPT" "$instance" "$reminder
$collab_footer

📢 **MANDATORY UPDATES** - After significant work, do ALL THREE:

1️⃣ **PROGRESS.md** - Add milestone with timestamp:
\`\`\`bash
# Get timestamp first (NEVER hallucinate!)
DATE=\$(~/.claude/scripts/get-timestamp.sh date)
TIME=\$(~/.claude/scripts/get-timestamp.sh time)
# Add row: | \$DATE | \$TIME | ${instance} | What you did | Notes |
\`\`\`

2️⃣ **agents/${instance}.md** - Update your context:
- Current Focus, Blockers, Key Learnings
- 'If I Crash' section with exact pickup point

3️⃣ **TTS + Telegram** - Notify Gergő:
\`\`\`bash
~/.claude/scripts/tts-write.sh \"Brief summary\"
~/.claude/telegram-orchestrator/send-summary.sh --session \$(tmux display-message -p '#S') \"Message\"
\`\`\`"

    return 0
}

# ============================================================================
# DAEMON LOOP
# ============================================================================

run_daemon() {
    log "VESC Watchdog v2.1 daemon started (PID: $$)"
    log "Features: Role reminders + Crash recovery + Stuck input detection (${STUCK_THRESHOLD}s threshold)"
    echo $$ > "$PID_FILE"

    while true; do
        local counter=$(get_counter)
        log "=== Cycle $counter ==="

        # Check health and recover if needed
        for instance in "${INSTANCES[@]}"; do
            local health=$(check_health "$instance")
            log "$instance: $health"

            case "$health" in
                SESSION_MISSING|CLAUDE_CRASHED)
                    log "⚠️ $instance needs recovery!"
                    restart_instance "$instance"
                    # Clear all tracking
                    clear_stuck_since "$instance"
                    clear_busy_since "$instance"
                    # Skip reminder for this cycle, let it recover
                    ;;
                HAS_STUCK_INPUT)
                    # Track when stuck input was first detected
                    local stuck_since=$(get_stuck_since "$instance")
                    local now=$(date +%s)

                    if [[ -z "$stuck_since" ]]; then
                        # First time seeing stuck input
                        log "$instance has stuck input - starting timer"
                        set_stuck_since "$instance" "$now"
                    else
                        # Check if threshold exceeded
                        local duration=$((now - stuck_since))
                        if [[ $duration -ge $STUCK_THRESHOLD ]]; then
                            # Get the stuck text and alert
                            local stuck_text=$(get_stuck_input "$instance")
                            handle_stuck_input "$instance" "$stuck_text" "$duration"
                            # Reset timer so we don't spam (will alert again next cycle if still stuck)
                            set_stuck_since "$instance" "$now"
                        else
                            log "$instance stuck for ${duration}s (threshold: ${STUCK_THRESHOLD}s)"
                        fi
                    fi
                    ;;
                HEALTHY_IDLE)
                    # Clear any stuck/stale tracking since input is cleared
                    clear_stuck_since "$instance"
                    clear_busy_since "$instance"
                    # Inject role-specific reminder
                    local reminder
                    case "$instance" in
                        claude-8) reminder=$(get_claude8_reminder $counter) ;;
                        claude-9) reminder=$(get_claude9_reminder $counter) ;;
                        claude-10) reminder=$(get_claude10_reminder $counter) ;;
                    esac
                    inject_reminder "$instance" "$reminder"
                    # Wait between injections to avoid overlap
                    sleep 5
                    ;;
                HEALTHY_BUSY)
                    # Clear any stuck tracking
                    clear_stuck_since "$instance"

                    # Track how long it's been "busy" and if output is changing
                    local now=$(date +%s)
                    local current_hash=$(get_content_hash "$instance")
                    local busy_since=$(get_busy_since "$instance")
                    local old_hash=$(get_busy_hash "$instance")

                    if [[ -z "$busy_since" ]]; then
                        # First time seeing busy, start tracking
                        set_busy_since "$instance" "$now" "$current_hash"
                        log "$instance is busy, starting stale tracker"
                    elif [[ "$current_hash" != "$old_hash" ]]; then
                        # Output changed, reset tracker
                        set_busy_since "$instance" "$now" "$current_hash"
                        log "$instance is busy with new output"
                    else
                        # Same output, check if stale
                        local duration=$((now - busy_since))
                        if [[ $duration -ge $STALE_BUSY_THRESHOLD ]]; then
                            handle_stale_busy "$instance" "$duration"
                            # Reset tracker so we don't spam
                            set_busy_since "$instance" "$now" "$current_hash"
                        else
                            log "$instance is busy, same output for ${duration}s"
                        fi
                    fi
                    ;;
            esac
        done

        increment_counter

        log "Sleeping for $((INTERVAL / 60)) minutes..."
        sleep $INTERVAL
    done
}

# ============================================================================
# COMMANDS
# ============================================================================

start_watchdog() {
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            echo "VESC Watchdog already running (PID: $pid)"
            return 1
        fi
    fi

    echo "Starting VESC Watchdog v2.1..."
    nohup "$0" daemon >> "$LOG_FILE" 2>&1 &
    echo "VESC Watchdog started (PID: $!)"
    echo "Monitoring: ${INSTANCES[*]}"
    echo "Interval: $((INTERVAL / 60)) minutes"
    echo "Features: Role reminders + Crash recovery + Stuck input detection"
    echo "Stuck threshold: ${STUCK_THRESHOLD}s"
    echo "Log: $LOG_FILE"
}

stop_watchdog() {
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            rm -f "$PID_FILE"
            echo "VESC Watchdog stopped (PID: $pid)"
            log "Watchdog stopped"
            return 0
        fi
    fi
    echo "VESC Watchdog not running"
    return 1
}

show_status() {
    echo "=== VESC Watchdog v2.1 Status ==="
    echo ""

    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            echo "Watchdog: ✅ RUNNING (PID: $pid)"
        else
            echo "Watchdog: ❌ DEAD (stale PID file)"
        fi
    else
        echo "Watchdog: ⏹️ STOPPED"
    fi

    echo ""
    echo "Instance Health:"
    for instance in "${INSTANCES[@]}"; do
        local health=$(check_health "$instance")
        local crash_count=$(get_crash_count "$instance")
        local status_icon
        local extra=""
        case "$health" in
            HEALTHY_IDLE) status_icon="✅ Idle" ;;
            HEALTHY_BUSY) status_icon="⏳ Busy" ;;
            SESSION_MISSING) status_icon="❌ Missing" ;;
            CLAUDE_CRASHED) status_icon="💀 Crashed" ;;
            HAS_STUCK_INPUT)
                status_icon="⚠️ Stuck"
                local stuck_since=$(get_stuck_since "$instance")
                if [[ -n "$stuck_since" ]]; then
                    local now=$(date +%s)
                    local duration=$((now - stuck_since))
                    extra=" (${duration}s)"
                fi
                ;;
        esac
        echo "  $instance: $status_icon (crashes: $crash_count)$extra"
    done

    echo ""
    echo "Reminder cycle: $(get_counter)"
    echo "Interval: $((INTERVAL / 60)) minutes"
    echo "Log: $LOG_FILE"

    if [[ -f "$LOG_FILE" ]]; then
        echo ""
        echo "Recent log:"
        tail -8 "$LOG_FILE"
    fi
}

manual_restart() {
    local instance=$1
    if [[ -z "$instance" ]]; then
        echo "Usage: $0 restart <instance>"
        echo "Instances: ${INSTANCES[*]}"
        return 1
    fi

    if [[ ! " ${INSTANCES[*]} " =~ " $instance " ]]; then
        echo "Unknown instance: $instance"
        echo "Valid instances: ${INSTANCES[*]}"
        return 1
    fi

    echo "Manually restarting $instance..."
    restart_instance "$instance"
}

unstick_cmd() {
    local instance=$1
    if [[ -z "$instance" ]]; then
        echo "Usage: $0 unstick <instance>"
        echo "Instances: ${INSTANCES[*]}"
        return 1
    fi

    if [[ ! " ${INSTANCES[*]} " =~ " $instance " ]]; then
        echo "Unknown instance: $instance"
        echo "Valid instances: ${INSTANCES[*]}"
        return 1
    fi

    if ! has_stuck_input "$instance"; then
        echo "$instance does not have stuck input"
        return 1
    fi

    echo "Pushing Enter on $instance..."
    unstick_instance "$instance"
    echo "Done. Check: tmux capture-pane -t $instance -p | tail -5"
}

clear_input_cmd() {
    local instance=$1
    if [[ -z "$instance" ]]; then
        echo "Usage: $0 clear <instance>"
        echo "Instances: ${INSTANCES[*]}"
        return 1
    fi

    if [[ ! " ${INSTANCES[*]} " =~ " $instance " ]]; then
        echo "Unknown instance: $instance"
        echo "Valid instances: ${INSTANCES[*]}"
        return 1
    fi

    echo "Clearing input on $instance..."
    clear_instance_input "$instance"
    echo "Done. Check: tmux capture-pane -t $instance -p | tail -5"
}

case "${1:-}" in
    start)
        start_watchdog
        ;;
    stop)
        stop_watchdog
        ;;
    status)
        show_status
        ;;
    restart)
        manual_restart "$2"
        ;;
    unstick)
        unstick_cmd "$2"
        ;;
    clear)
        clear_input_cmd "$2"
        ;;
    daemon)
        run_daemon
        ;;
    *)
        echo "VESC Watchdog v2.1 - Role reminders + Crash recovery + Stuck input detection"
        echo ""
        echo "Usage: $0 {start|stop|status|restart|unstick|clear} [instance]"
        echo ""
        echo "Commands:"
        echo "  start              Start watchdog daemon"
        echo "  stop               Stop watchdog"
        echo "  status             Show status and health"
        echo "  restart <instance> Manually restart an instance"
        echo "  unstick <instance> Push Enter on stuck instance"
        echo "  clear <instance>   Clear/discard input on stuck instance"
        echo ""
        echo "Monitored: ${INSTANCES[*]}"
        echo "Interval: $((INTERVAL / 60)) minutes"
        echo "Stuck threshold: ${STUCK_THRESHOLD}s"
        exit 1
        ;;
esac
