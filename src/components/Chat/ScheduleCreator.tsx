import React, { useState, useEffect, useRef } from 'react';
import { API_CONFIG, authenticatedApiRequest } from '../../config/api';
import styles from './Chat.module.css';

interface ScheduleData {
  rawText: string;
}

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  type: 'user' | 'system' | 'success';
}

interface ScheduleCreatorProps {
  onScheduleCreated?: () => void;
}

const ScheduleCreator: React.FC<ScheduleCreatorProps> = ({ onScheduleCreated }) => {
  const [rawText, setRawText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 초기 환영 메시지
  useEffect(() => {
    setMessages([
      {
        id: '0',
        text: '새로운 스케줄을 생성해보세요! 텍스트 영역에 상세 내용을 입력하면 됩니다.',
        timestamp: new Date(),
        type: 'system'
      }
    ]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!rawText.trim()) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: '텍스트 내용을 입력해주세요!',
        timestamp: new Date(),
        type: 'system'
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    setIsLoading(true);

    // 사용자 입력 메시지 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      text: `스케줄 생성 요청`,
      timestamp: new Date(),
      type: 'user'
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      console.log('📅 스케줄 생성 요청 시작');
      
      const scheduleData: ScheduleData = {
        rawText: rawText.trim()
      };

      console.log('📤 전송할 스케줄 데이터:', scheduleData);
      
      // API 요청 - API_CONFIG의 CREATE_TASK 엔드포인트 사용
      const result = await authenticatedApiRequest(API_CONFIG.ENDPOINTS.CREATE_TASK, {
        method: 'POST',
        body: JSON.stringify(scheduleData),
      });
      
      console.log('✅ 스케줄 생성 성공:', result);
      
      // 성공 메시지 추가
      const successMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '✨ 스케줄이 성공적으로 생성되었습니다!',
        timestamp: new Date(),
        type: 'success'
      };
      setMessages(prev => [...prev, successMessage]);
      
      // 캘린더 새로고침 콜백 호출
      if (onScheduleCreated) {
        onScheduleCreated();
      }

      // 폼 리셋
      setRawText('');
      
      // textarea 높이 리셋
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
    } catch (error: any) {
      console.error('💥 스케줄 생성 실패:', error);
      
      // 에러 메시지 추가
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `❌ 스케줄 생성에 실패했습니다: ${error.message || '알 수 없는 오류'}`,
        timestamp: new Date(),
        type: 'system'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawText(e.target.value);
    
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
            <h2>스케줄 생성</h2>
            <p>새로운 스케줄을 만들어보세요</p>
          </div>
          <button className={styles.headerButton}>
            <svg className={styles.headerIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {messages.length > 0 && (
          <div className={styles.messagesList}>
            {messages.map((msg) => (
              <div key={msg.id} className={`${styles.message} ${styles[msg.type]}`}>
                <p className={styles.systemMessage}>{msg.text}</p>
                <p className={styles.messageTime}>
                  {msg.timestamp.toLocaleTimeString('ko-KR', { 
                    hour: 'numeric', 
                    minute: '2-digit'
                  })}
                </p>
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
              value={rawText}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="스케줄 내용을 입력하세요... (필수)"
              rows={3}
              className={styles.textarea}
              style={{ minHeight: '60px' }}
            />
            <div className={styles.inputFooter}>
              <div className={styles.inputActions}>
                <button
                  type="button"
                  className={styles.actionIcon}
                  title="첨부파일 추가"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                
              </div>
              <button
                type="submit"
                disabled={!rawText.trim() || isLoading}
                className={`${styles.sendButton} ${rawText.trim() && !isLoading ? styles.enabled : styles.disabled}`}
              >
                {isLoading ? '생성 중...' : '스케줄 생성'}
              </button>
            </div>
          </div>
          <p className={styles.inputHint}>
            Enter로 생성 • Shift+Enter로 줄바꿈
          </p>
        </div>
      </form>
    </div>
  );
};

export default ScheduleCreator;