import React, { useState, useRef, useEffect } from 'react';
import styles from './Chat.module.css';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  type: 'user' | 'system';
}

const Chat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: 'Welcome to Neekly! Start typing your notes below.',
      timestamp: new Date(),
      type: 'system'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        timestamp: new Date(),
        type: 'user'
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h2>Notes</h2>
            <p>All your thoughts in one place</p>
          </div>
          <button className={styles.headerButton}>
            <svg className={styles.headerIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {messages.length <= 1 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>Start writing</h3>
            <p className={styles.emptyDescription}>
              Capture your ideas, meeting notes, or daily thoughts. Everything syncs automatically.
            </p>
          </div>
        ) : (
          <div className={styles.messagesList}>
            {messages.map((msg) => (
              <div key={msg.id} className={`${styles.message} ${msg.type === 'system' ? styles.system : ''}`}>
                {msg.type === 'system' ? (
                  <p className={styles.systemMessage}>{msg.text}</p>
                ) : (
                  <div className={styles.userMessage}>
                    <div className={styles.messageContent}>
                      <p className={styles.messageText}>{msg.text}</p>
                    </div>
                    <div className={styles.messageActions}>
                      <p className={styles.messageTime}>
                        {msg.timestamp.toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit'
                        })}
                      </p>
                      <button className={styles.actionButton}>Edit</button>
                      <button className={styles.actionButton}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <div className={styles.inputBox}>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Write a note..."
              rows={1}
              className={styles.textarea}
              style={{ minHeight: '24px' }}
            />
            <div className={styles.inputFooter}>
              <div className={styles.inputActions}>
                <button
                  type="button"
                  className={styles.actionIcon}
                  title="Add attachment"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={styles.actionIcon}
                  title="Add emoji"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              <button
                type="submit"
                disabled={!message.trim()}
                className={`${styles.sendButton} ${message.trim() ? styles.enabled : styles.disabled}`}
              >
                Send
              </button>
            </div>
          </div>
          <p className={styles.inputHint}>
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </form>
    </div>
  );
};

export default Chat;