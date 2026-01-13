'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: messages }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, an error occurred. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <h1 style={styles.title}>VESC_IT</h1>
        <p style={styles.subtitle}>VESC & Refloat Configuration Assistant</p>
      </header>

      <div style={styles.chatContainer}>
        {messages.length === 0 ? (
          <div style={styles.welcome}>
            <h2>Welcome! Ask me anything about:</h2>
            <ul style={styles.topicList}>
              <li>VESC motor configuration</li>
              <li>Refloat package tuning</li>
              <li>FOC settings and troubleshooting</li>
              <li>CAN bus multi-VESC setup</li>
              <li>WiFi/BLE connectivity</li>
            </ul>
          </div>
        ) : (
          <div style={styles.messages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...styles.message,
                  ...(msg.role === 'user' ? styles.userMessage : styles.assistantMessage),
                }}
              >
                <div style={styles.messageContent}>{msg.content}</div>
              </div>
            ))}
            {isLoading && (
              <div style={{ ...styles.message, ...styles.assistantMessage }}>
                <div style={styles.messageContent}>Thinking...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about VESC configuration..."
          style={styles.input}
          disabled={isLoading}
        />
        <button type="submit" style={styles.button} disabled={isLoading}>
          Send
        </button>
      </form>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  main: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '2rem',
    color: '#3ecf8e',
    margin: 0,
  },
  subtitle: {
    color: '#888',
    marginTop: '5px',
  },
  chatContainer: {
    flex: 1,
    overflow: 'auto',
    marginBottom: '20px',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '20px',
  },
  welcome: {
    textAlign: 'center',
    color: '#888',
  },
  topicList: {
    listStyle: 'none',
    marginTop: '15px',
    lineHeight: '1.8',
  },
  messages: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  message: {
    maxWidth: '80%',
    padding: '12px 16px',
    borderRadius: '12px',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3ecf8e',
    color: '#000',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#222',
  },
  messageContent: {
    whiteSpace: 'pre-wrap',
  },
  inputForm: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '1rem',
    border: '1px solid #333',
    borderRadius: '8px',
    backgroundColor: '#111',
    color: '#fff',
    outline: 'none',
  },
  button: {
    padding: '12px 24px',
    fontSize: '1rem',
    backgroundColor: '#3ecf8e',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};
