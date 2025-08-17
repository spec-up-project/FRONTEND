// EventModal.tsx
import React, { useState, useEffect } from 'react';
import styles from './EventModal.module.css';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id?: string;
    title: string;
    content?: string;
    rawText?: string;          // 실제 설명 데이터
    date?: string;
    createDate?: string;       // 실제 생성 날짜
    modifyDate?: string;       // 수정 날짜
    startTime: string | null;  // null 허용
    endTime: string | null;    // null 허용
    isAllDay?: boolean;
    hasTeamsMeeting?: boolean;
    hasReminder?: boolean;
    tscheduleUid?: string;     // 실제 데이터에 있는 필드
    source?: string;           // 실제 데이터에 있는 필드
  } | null;
  onSave: (updatedEvent: any) => void;
  onDelete: (eventId: string) => void;
  allEvents?: Array<any>;      // 타입을 any로 변경 (전체 Event 객체 받기 위해)
}

interface TimeSlot {
  hour: number;
  label: string;
  events: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
  }>;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  onSave,
  onDelete,
  allEvents = []
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedPersonalEvent, setSelectedPersonalEvent] = useState<any>(null);

  // 타임라인 시간대 생성 (오전 7시 ~ 오후 10시)
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 7; hour <= 22; hour++) {
      const isAM = hour < 12;
      const displayHour = hour === 12 ? 12 : hour > 12 ? hour - 12 : hour;
      const label = `${isAM ? '오전' : '오후'} ${displayHour}`;
      
      // 해당 시간대의 이벤트 필터링
      const hourEvents = allEvents.filter(evt => {
        if (!evt.startTime) return false;
        const eventStartHour = parseInt(evt.startTime.split(':')[0]);
        return eventStartHour === hour;
      });
      
      slots.push({
        hour,
        label,
        events: hourEvents
      });
    }
    return slots;
  };

  // 이벤트 데이터 초기화 (controlled input 문제 해결!)
  useEffect(() => {
    console.log('Event data:', event); // 디버깅용
    
    if (event) {
      // 실제 데이터 구조에 맞게 매핑 (항상 문자열 보장!)
      setTitle(event.title || '');
      
      // rawText를 content로 사용 (실제 설명 데이터)
      setContent(event.rawText || event.content || '');
      
      // createDate를 date로 변환 (ISO 문자열을 YYYY-MM-DD 형식으로)
      if (event.createDate) {
        const dateStr = new Date(event.createDate).toISOString().split('T')[0];
        setDate(dateStr);
      } else {
        const today = new Date().toISOString().split('T')[0];
        setDate(today);
      }
      
      // startTime, endTime이 null이면 기본값 설정 (항상 문자열!)
      setStartTime(event.startTime || '09:00');
      setEndTime(event.endTime || '10:00');
      
    } else {
      // 새 이벤트 생성 시 기본값
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setStartTime('09:00');
      setEndTime('10:00');
      setTitle('');
      setContent('');
    }
  }, [event]);

  const handleSave = () => {
    // selectedPersonalEvent가 있으면 그걸 기준으로, 없으면 기존 event 기준으로
    const baseEvent = selectedPersonalEvent || event;
    
    const updatedEvent = {
      id: baseEvent?.id || baseEvent?.tscheduleUid || `event-${Date.now()}`,
      title,
      content, // 사용자가 수정한 내용
      rawText: content, // rawText로도 저장
      date,
      createDate: baseEvent?.createDate || new Date().toISOString(),
      modifyDate: new Date().toISOString(),
      startTime,
      endTime,
      tscheduleUid: baseEvent?.tscheduleUid,
      source: baseEvent?.source || "text"
    };
    
    console.log('Saving event:', updatedEvent); // 디버깅용
    
    onSave(updatedEvent);
    setSelectedPersonalEvent(null);
    onClose();
  };

  const handleDelete = () => {
    if (event && window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
      onDelete(event.id || event.tscheduleUid || '');
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePersonalEventClick = (personalEvent: any) => {
    console.log('Personal event clicked:', personalEvent); // 디버깅용
    
    setSelectedPersonalEvent(personalEvent);
    
    // 개인 이벤트 데이터 구조에 맞게 설정
    setTitle(personalEvent.title || '');
    setContent(personalEvent.rawText || personalEvent.content || '');
    
    // 날짜 처리 - createDate에서 변환
    if (personalEvent.createDate) {
      const dateStr = new Date(personalEvent.createDate).toISOString().split('T')[0];
      setDate(dateStr);
    } else if (personalEvent.date) {
      setDate(personalEvent.date);
    }
    
    // 시간 처리 - null이면 기본값
    setStartTime(personalEvent.startTime || '09:00');
    setEndTime(personalEvent.endTime || '10:00');
  };

  if (!isOpen) return null;

  const timeSlots = generateTimeSlots();
  const currentHour = new Date().getHours();

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContainer}>
        {/* 메인 컨텐츠 */}
        <div className={styles.modalContent}>
          {/* 왼쪽 폼 영역 */}
          <div className={styles.leftSection}>
            {/* 제목 입력 */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <svg className={styles.formIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                제목
              </label>
              <input
                type="text"
                className={styles.titleInput}
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* 내용 입력 */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <svg className={styles.formIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                설명
              </label>
              <textarea
                className={styles.contentTextarea}
                placeholder="설명 추가 또는 문서 첨부"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            {/* 날짜/시간 선택 */}
            <div className={styles.dateTimeRow}>
              <div className={styles.dateTimeGroup}>
                <label className={styles.formLabel}>
                  <svg className={styles.formIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  날짜
                </label>
                <input
                  type="date"
                  className={styles.dateTimeInput}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className={styles.dateTimeGroup}>
                <label className={styles.formLabel}>
                  <svg className={styles.formIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  시작 시간
                </label>
                <input
                  type="time"
                  className={styles.dateTimeInput}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className={styles.dateTimeGroup}>
                <label className={styles.formLabel}>
                  <svg className={styles.formIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  종료 시간
                </label>
                <input
                  type="time"
                  className={styles.dateTimeInput}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* 저장 버튼 */}
            <div className={styles.saveButtonContainer}>
              <button className={styles.saveButton} onClick={handleSave}>
                저장
              </button>
            </div>
          </div>

          {/* 오른쪽 타임라인 */}
          <div className={styles.rightSection}>
            <div className={styles.timelineHeader}>
              <div className={styles.timelineTitle}>일정 타임라인</div>
              <div className={styles.timelineDate}>
                {date && new Date(date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            <div className={styles.timelineContent}>
              {timeSlots.map((slot) => {
                // startTime이 빈 문자열이거나 유효하지 않을 때를 위한 안전 체크
                const startHour = startTime ? parseInt(startTime.split(':')[0]) : -1;
                
                return (
                  <div key={slot.hour} className={styles.timeSlot}>
                    <div className={styles.timeLabel}>{slot.label}</div>
                    <div className={styles.timeContent}>
                      {/* 현재 편집 중인 이벤트 표시 */}
                      {startHour === slot.hour && title && startTime && endTime && (
                        <div className={`${styles.eventBlock} ${styles.current}`}>
                          {title || '(제목 없음)'} ({startTime} - {endTime})
                        </div>
                      )}
                      
                      {/* 다른 이벤트들 표시 */}
                      {slot.events
                        .filter(evt => evt.id !== (event?.id || event?.tscheduleUid))
                        .map((evt) => (
                          <div 
                            key={evt.id} 
                            className={`${styles.eventBlock} ${selectedPersonalEvent?.id === evt.id || selectedPersonalEvent?.tscheduleUid === evt.id ? styles.selected : ''}`}
                            onClick={() => {
                              // Calendar에서 받은 실제 이벤트 데이터 구조에 맞게 변환
                              // allEvents는 간소화된 데이터라서 실제 이벤트 찾아야 함
                              const fullEvent = allEvents.find(e => e.id === evt.id);
                              if (fullEvent) {
                                handlePersonalEventClick(fullEvent);
                              } else {
                                // fallback: 기본 구조로 생성
                                const eventData = {
                                  id: evt.id,
                                  title: evt.title,
                                  startTime: evt.startTime,
                                  endTime: evt.endTime,
                                  date: date, // 현재 선택된 날짜 사용
                                  rawText: evt.title, // 임시로 title 사용
                                  content: '',
                                  createDate: new Date().toISOString(),
                                  tscheduleUid: evt.id
                                };
                                handlePersonalEventClick(eventData);
                              }
                            }}
                          >
                            {evt.title} ({evt.startTime} - {evt.endTime})
                          </div>
                        ))}
                    </div>
                    
                    {/* 현재 시간 표시 */}
                    {currentHour === slot.hour && (
                      <div 
                        className={styles.currentTimeLine}
                        style={{
                          top: `${(new Date().getMinutes() / 60) * 60}px`
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;