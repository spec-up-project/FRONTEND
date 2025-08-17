import React, { useState, useEffect, useRef } from 'react';
import { API_CONFIG, authenticatedApiRequest } from '../../../config/api';
import styles from './WeeklyScheduleCreator.module.css';

interface ScheduleData {
  chat: string;
}

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  type: 'user' | 'system' | 'success';
}

interface WeeklyScheduleCreatorProps {
  onScheduleCreated?: () => void;
}

const WeeklyScheduleCreator: React.FC<WeeklyScheduleCreatorProps> = ({ onScheduleCreated }) => {
  const [rawText, setRawText] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
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
        text: '새로운 주간일정을 생성해보세요! 아래 필드들을 채우고 텍스트 영역에 상세 내용을 입력하면 됩니다.',
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

    // 200자 제한 검증
    if (rawText.trim().length > 200) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: '텍스트는 200자 이내로 입력해주세요!',
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
      text: `주간일정 생성 요청: ${title || '제목 없음'}`,
      timestamp: new Date(),
      type: 'user'
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      console.log('📅 주간일정 생성 요청 시작');
      
      const scheduleData: ScheduleData = {
        chat: rawText.trim()
      };

      console.log('📤 전송할 주간일정 데이터:', scheduleData);
      
      // TaskPage용 API 엔드포인트 사용 (예: CREATE_WEEKLY_SCHEDULE)
      const result = await authenticatedApiRequest('/api/report/chat', {
        method: 'POST',
        body: JSON.stringify(scheduleData),
      }, 600000); // 타임아웃을 30초로 증가
      
      console.log('✅ 주간일정 생성 성공:', result);
      
      // 성공 메시지 추가
      const successMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '✨ 주간일정이 성공적으로 생성되었습니다!',
        timestamp: new Date(),
        type: 'success'
      };
      setMessages(prev => [...prev, successMessage]);
      
      // 콜백 호출 - 리포트 목록 새로고침
      if (onScheduleCreated) {
        onScheduleCreated();
      }

      // 폼 리셋
      setRawText('');
      setTitle('');
      setContent('');
      setSource('');
      
      // textarea 높이 리셋
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
    } catch (error: any) {
      console.error('💥 주간일정 생성 실패:', error);
      
      // 에러 메시지 추가
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `❌ 주간일정 생성에 실패했습니다: ${error.message || '알 수 없는 오류'}`,
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
            <h2>주간일정생성</h2>
            <p>새로운 주간일정을 만들어보세요</p>
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

      {/* Form Fields */}
      <div className={styles.formFields} style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        

        </div>
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
              placeholder="상세 내용을 입력하세요... (200자 이내, 필수)"
              rows={3}
              className={styles.textarea}
              style={{ minHeight: '60px' }}
            />
            <div className={styles.inputFooter}>
              <div className={styles.inputActions}>

              </div>
              <button
                type="submit"
                disabled={!rawText.trim() || isLoading}
                className={`${styles.sendButton} ${rawText.trim() && !isLoading ? styles.enabled : styles.disabled}`}
              >
                {isLoading ? '생성 중...' : '주간일정 생성'}
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

export default WeeklyScheduleCreator;
