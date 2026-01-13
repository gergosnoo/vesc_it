#!/bin/bash
# VESC Watchdog v1.0 - Role-specific reminders for VESC_IT agents
#
# Usage:
#   ./vesc-watchdog.sh start    - Start watchdog daemon
#   ./vesc-watchdog.sh stop     - Stop watchdog
#   ./vesc-watchdog.sh status   - Show status
#
# Monitors: claude-8, claude-9, claude-10
# Interval: 10 minutes
# Purpose: Realign agents to their specific roles with unique reminders

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/.vesc-watchdog.pid"
LOG_FILE="$SCRIPT_DIR/logs/vesc-watchdog.log"
INJECT_SCRIPT="$HOME/.claude/telegram-orchestrator/inject-prompt.sh"
INTERVAL=600  # 10 minutes

# Instances to watch
INSTANCES=("claude-8" "claude-9" "claude-10")

# Reminder rotation counter (persisted)
COUNTER_FILE="$SCRIPT_DIR/.vesc-watchdog-counter"

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

# Check if instance is idle (shows "bypass permissions" at bottom)
is_idle() {
    local instance=$1
    tmux capture-pane -t "$instance" -p 2>/dev/null | tail -3 | grep -q "bypass permissions"
}

# Check if instance exists
instance_exists() {
    tmux has-session -t "$1" 2>/dev/null
}

# Role-specific reminders for claude-8 (Infrastructure Lead)
get_claude8_reminder() {
    local idx=$1
    local reminders=(
        "🔧 INFRASTRUCTURE CHECK: What's your Supabase status? If not created yet, do it NOW. Don't wait for perfect docs - use what exists in knowledge-base/."

        "⚡ ACTIVE BUILDING: You're the engineer. Build something concrete in the next 10 minutes. Embedding pipeline? Chat UI? n8n workflow? Pick one, make progress."

        "🔗 INTEGRATION FOCUS: Your job is to connect pieces, not write content. Need docs? Ask claude-9. Have something testable? Tell claude-10."

        "📦 DEPLOYMENT CHECK: What can you deploy RIGHT NOW? Even a basic Next.js skeleton on Vercel shows progress. Ship early, iterate often."

        "🎯 ROLE REMINDER: You own INFRASTRUCTURE (Supabase, Vercel, n8n, embeddings). Claude-9 owns CONTENT. Claude-10 owns TESTING. Stay in your lane, move fast."

        "💬 COMMUNICATION CHECK: When did you last message your teammates? If you need content, inject to claude-9. If ready for testing, inject to claude-10."
    )
    echo "${reminders[$((idx % ${#reminders[@]}))]}"
}

# Role-specific reminders for claude-9 (Knowledge Architect)
get_claude9_reminder() {
    local idx=$1
    local reminders=(
        "📚 CONTENT CREATION: You're not just a reviewer - you're the WRITER. What documentation are you actively creating right now? Pick a VESC repo and deep-dive."

        "🎯 PRIORITY CHECK: Has claude-10 sent you topic priorities? If not, ask them! If yes, are you working on the highest priority topics?"

        "✍️ ACTIVE WRITING: Write 500 words in the next 10 minutes. Pick: bldc/ FOC explanation, refloat/ tuning guide, vesc_tool/ wizard walkthrough. GO."

        "🔍 SOURCE VERIFICATION: Every claim needs a source. Open a sibling repo (../bldc, ../refloat) and extract REAL code examples and parameters."

        "📤 OUTPUT CHECK: When did you last notify claude-8 that content is ready? They need your docs to embed. Push content, don't hoard it."

        "🧠 EMBEDDING-FRIENDLY: Write for RAG retrieval. Clear headers, self-contained sections, 500-1000 token chunks. Think: 'How will this be retrieved?'"
    )
    echo "${reminders[$((idx % ${#reminders[@]}))]}"
}

# Role-specific reminders for claude-10 (User Advocate)
get_claude10_reminder() {
    local idx=$1
    local reminders=(
        "🔎 QUESTION MINING: Have you searched VESC forums today? Reddit? GitHub issues? Find 10 REAL user questions in the next 10 minutes."

        "📊 PRIORITIZATION: What are the TOP 5 topics users struggle with? Tell claude-9 so they know what to write. Your research drives their priorities."

        "👤 USER VOICE: You represent beginners, intermediates, AND experts. What would a confused newbie ask? What would an expert need to know?"

        "📝 TEST SUITE: Have you created qa/test-suite.md? Write 20 questions with expected answers. This is YOUR primary deliverable."

        "🔗 FEEDBACK LOOP: When did you last message claude-9 with priorities or claude-8 asking about testing? You're the bridge between users and the system."

        "🌐 SOURCE DIVERSITY: Check vesc-project.com/forum, r/ElectricSkateboarding, r/onewheel. Different communities = different questions."
    )
    echo "${reminders[$((idx % ${#reminders[@]}))]}"
}

inject_reminder() {
    local instance=$1
    local reminder=$2

    if ! instance_exists "$instance"; then
        log "Instance $instance does not exist, skipping"
        return 1
    fi

    if ! is_idle "$instance"; then
        log "$instance is busy (thinking), skipping reminder"
        return 0
    fi

    log "Injecting reminder to $instance"
    "$INJECT_SCRIPT" "$instance" "$reminder

Remember: Send TTS + Telegram reports after significant work!
Re-read CLAUDE.md if you've lost focus: cat CLAUDE.md | grep -A 50 'Claude-${instance##*-}'"

    return 0
}

run_daemon() {
    log "VESC Watchdog daemon started (PID: $$)"
    echo $$ > "$PID_FILE"

    while true; do
        local counter=$(get_counter)
        log "=== Reminder cycle $counter ==="

        # Get role-specific reminders
        local reminder8=$(get_claude8_reminder $counter)
        local reminder9=$(get_claude9_reminder $counter)
        local reminder10=$(get_claude10_reminder $counter)

        # Inject to each instance
        inject_reminder "claude-8" "$reminder8"
        inject_reminder "claude-9" "$reminder9"
        inject_reminder "claude-10" "$reminder10"

        increment_counter

        log "Sleeping for $((INTERVAL / 60)) minutes..."
        sleep $INTERVAL
    done
}

start_watchdog() {
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            echo "VESC Watchdog already running (PID: $pid)"
            return 1
        fi
    fi

    echo "Starting VESC Watchdog..."
    nohup "$0" daemon >> "$LOG_FILE" 2>&1 &
    echo "VESC Watchdog started (PID: $!)"
    echo "Monitoring: claude-8, claude-9, claude-10"
    echo "Interval: 10 minutes"
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
    echo "=== VESC Watchdog Status ==="

    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            echo "Status: RUNNING (PID: $pid)"
        else
            echo "Status: DEAD (stale PID file)"
        fi
    else
        echo "Status: STOPPED"
    fi

    echo ""
    echo "Monitored Instances:"
    for instance in "${INSTANCES[@]}"; do
        if instance_exists "$instance"; then
            if is_idle "$instance"; then
                echo "  $instance: ✅ Running (idle)"
            else
                echo "  $instance: ⏳ Running (busy)"
            fi
        else
            echo "  $instance: ❌ Not found"
        fi
    done

    echo ""
    echo "Reminder cycle: $(get_counter)"
    echo "Log: $LOG_FILE"

    if [[ -f "$LOG_FILE" ]]; then
        echo ""
        echo "Recent log:"
        tail -5 "$LOG_FILE"
    fi
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
    daemon)
        run_daemon
        ;;
    *)
        echo "Usage: $0 {start|stop|status}"
        echo ""
        echo "VESC Watchdog - Role-specific reminders for VESC_IT agents"
        echo "Monitors: claude-8, claude-9, claude-10"
        echo "Interval: 10 minutes"
        exit 1
        ;;
esac
