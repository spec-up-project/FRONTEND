// Calendar.tsx (모달 통합 버전)
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { apiRequest, API_CONFIG } from '../../config/api';
import EventModal from './EventModal'; // 모달 컴포넌트 import
import styles from './Calendar.module.css';

interface ScheduleEvent {
  title: string;
  content: string;
  startTime: string;
  endTime: string;
  rawText: string;
  source: string;
  createDate: string;
  modifyDate: string;
  tscheduleUid: string;
}

interface Event {
  id: string;
  date: string;
  time: string;
  title: string;
  content?: string;
  rawText?: string;        // 🔥 추가!
  startTime: string;
  endTime: string;
  color: string;
  isAllDay?: boolean;
  hasTeamsMeeting?: boolean;
  hasReminder?: boolean;
  createDate?: string;     // 🔥 추가!
  modifyDate?: string;     // 🔥 추가!
  tscheduleUid?: string;   // 🔥 추가!
  source?: string;         // 🔥 추가!
}

interface CalendarProps {
  onRefresh?: () => void;
}

export interface CalendarRef {
  fetchSchedules: () => void;
}

const Calendar = forwardRef<CalendarRef, CalendarProps>((props, ref) => {
  const { onRefresh } = props;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // ref를 통해 외부에서 호출할 수 있는 함수들 노출
  useImperativeHandle(ref, () => ({
    fetchSchedules
  }));

  // 색상 배열 정의
  const colors = ['blue', 'purple', 'green', 'pink', 'orange', 'red', 'teal', 'indigo'];

  // API에서 스케줄 데이터 가져오기
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_SCHEDULES, {
        method: 'GET',
      });
      
      console.log('📅 스케줄 데이터 받음:', response);
      
      // 응답이 배열이 아닌 경우 처리
      let schedules: ScheduleEvent[] = [];
      if (Array.isArray(response)) {
        schedules = response;
      } else if (response && typeof response === 'object') {
        if (Array.isArray(response.data)) {
          schedules = response.data;
        } else if (Array.isArray(response.schedules)) {
          schedules = response.schedules;
        } else if (Array.isArray(response.items)) {
          schedules = response.items;
        } else {
          console.warn('⚠️ 응답에서 스케줄 배열을 찾을 수 없음:', response);
          setEvents([]);
          setLoading(false);
          return;
        }
      } else {
        console.warn('⚠️ 예상치 못한 응답 형식:', response);
        setEvents([]);
        setLoading(false);
        return;
      }
      
      // API 응답을 캘린더 이벤트 형식으로 변환
      const convertedEvents: Event[] = schedules
  .map((schedule: ScheduleEvent, index: number) => {
    let dateToUse = schedule.startTime;
    if (!dateToUse || dateToUse === null) {
      if (schedule.createDate) {
        dateToUse = schedule.createDate;
      } else {
        dateToUse = new Date().toISOString();
      }
    }

    const startDate = new Date(dateToUse);
    const endDate = schedule.endTime ? new Date(schedule.endTime) : new Date(startDate.getTime() + 60 * 60 * 1000);

    if (isNaN(startDate.getTime())) {
      console.warn('⚠️ 유효하지 않은 날짜:', dateToUse);
      return null;
    }

    const event: Event = {
      id: schedule.tscheduleUid,
      date: startDate.toISOString().split('T')[0],
      time: startDate.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      title: schedule.title,
      content: schedule.content,
      rawText: schedule.rawText,           // 🔥 중요! 이걸 빼먹었었어!
      startTime: `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`,
      endTime: `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`,
      color: colors[index % colors.length],
      isAllDay: false,
      hasTeamsMeeting: false,
      hasReminder: false,
      createDate: schedule.createDate,     // 🔥 추가
      modifyDate: schedule.modifyDate,     // 🔥 추가
      tscheduleUid: schedule.tscheduleUid, // 🔥 추가
      source: schedule.source              // 🔥 추가
    };

    return event;
  })
  .filter((event): event is Event => event !== null);
      
      setEvents(convertedEvents);
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('❌ 스케줄 데이터 가져오기 실패:', err);
      setError(err instanceof Error ? err.message : '스케줄을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 이벤트 클릭 핸들러
  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // 날짜 클릭 핸들러 (새 이벤트 생성)
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    // 새 이벤트 생성을 위한 기본 데이터
    const newEvent: Event = {
      id: '',
      date: formatDateKey(date),
      time: '09:00',
      title: '',
      content: '',
      rawText: '',              // 🔥 추가
      startTime: '09:00',
      endTime: '10:00',
      color: 'blue',
      isAllDay: false,
      hasTeamsMeeting: false,
      hasReminder: false,
      createDate: new Date().toISOString(),  // 🔥 추가
      source: 'text'            // 🔥 추가
    };
    setSelectedEvent(newEvent);
    setIsModalOpen(true);
  };

  // 이벤트 저장 핸들러
  const handleSaveEvent = async (updatedEvent: Event) => {
    try {
      // API 호출하여 이벤트 저장
      if (updatedEvent.id) {
        // 기존 이벤트 수정
        await apiRequest(API_CONFIG.ENDPOINTS.UPDATE_SCHEDULE, {
          method: 'PUT',
          body: JSON.stringify(updatedEvent)
        });
        
        setEvents(prevEvents => 
          prevEvents.map(evt => evt.id === updatedEvent.id ? updatedEvent : evt)
        );
      } else {
        // 새 이벤트 생성
        const response = await apiRequest(API_CONFIG.ENDPOINTS.CREATE_SCHEDULE, {
          method: 'POST',
          body: JSON.stringify(updatedEvent)
        });
        
        const newEvent = { ...updatedEvent, id: response.id || `event-${Date.now()}` };
        setEvents(prevEvents => [...prevEvents, newEvent]);
      }
      
      setIsModalOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error('❌ 이벤트 저장 실패:', err);
      alert('이벤트 저장에 실패했습니다.');
    }
  };

  // 이벤트 삭제 핸들러
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await apiRequest(API_CONFIG.ENDPOINTS.DELETE_SCHEDULE, {
        method: 'DELETE',
        body: JSON.stringify({ id: eventId })
      });
      
      setEvents(prevEvents => prevEvents.filter(evt => evt.id !== eventId));
      setIsModalOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error('❌ 이벤트 삭제 실패:', err);
      alert('이벤트 삭제에 실패했습니다.');
    }
  };

  // 컴포넌트 마운트 시 스케줄 데이터 가져오기
  useEffect(() => {
    fetchSchedules();
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDay = new Date(year, month, i);
      const today = new Date();
      const isToday = 
        currentDay.getDate() === today.getDate() &&
        currentDay.getMonth() === today.getMonth() &&
        currentDay.getFullYear() === today.getFullYear();
      
      days.push({
        date: currentDay,
        isCurrentMonth: true,
        isToday
      });
    }

    // Next month's leading days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  };

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction));
  };

  // 선택한 날짜의 이벤트들을 시간 순으로 정렬
  const getEventsForDate = (date: string) => {
    return events
      .filter(event => event.date === date)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Loading State */}
        {loading && (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>스케줄을 불러오는 중...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>❌ {error}</p>
            <button 
              onClick={fetchSchedules}
              className={styles.retryButton}
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Calendar Navigation */}
        <div className={styles.calendarContainer}>
          <div className={styles.navigation}>
            <div className={styles.navigationLeft}>
              <h2 className={styles.monthTitle}>
                {currentDate.toLocaleDateString('ko-KR', { month: 'long', year: 'numeric' })}
              </h2>
              <div className={styles.navButtons}>
                <button 
                  onClick={() => navigateMonth(-1)}
                  className={styles.navButton}
                >
                  <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={() => navigateMonth(1)}
                  className={styles.navButton}
                >
                  <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className={styles.navigationRight}>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className={styles.todayButton}
              >
                Today
              </button>
              <div className={styles.viewToggle}>
                <button className={styles.viewButton}>Day</button>
                <button className={styles.viewButton}>Week</button>
                <button className={`${styles.viewButton} ${styles.active}`}>Month</button>
                <button className={styles.viewButton}>Year</button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className={styles.calendarContent}>
            {/* Weekdays */}
            <div className={styles.weekdays}>
              {weekDays.map(day => (
                <div key={day} className={styles.weekday}>
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className={styles.daysGrid}>
              {days.map((day, index) => {
                const dateKey = formatDateKey(day.date);
                const dayEvents = getEventsForDate(dateKey);
                const isSelected = selectedDate && 
                  day.date.toDateString() === selectedDate.toDateString();
                
                return (
                  <div
                    key={index}
                    className={`
                      ${styles.dayCell}
                      ${!day.isCurrentMonth ? styles.otherMonth : ''}
                      ${isSelected ? styles.selected : ''}
                      ${day.isToday && !isSelected ? styles.today : ''}
                    `}
                    onClick={() => handleDateClick(day.date)}
                  >
                    <div className={styles.dayNumber}>
                      {day.isToday ? (
                        <span className={styles.todayIndicator}>
                          {day.date.getDate()}
                        </span>
                      ) : (
                        <span className={styles.dayNumberWrapper}>
                          {day.date.getDate()}
                        </span>
                      )}
                    </div>
                    
                    {/* Events */}
                    {dayEvents.length > 0 && day.isCurrentMonth && (
                      <div className={styles.eventsContainer}>
                        {dayEvents.slice(0, 3).map((event) => (
                          <div 
                            key={event.id} 
                            className={`${styles.event} ${styles[event.color as keyof typeof styles]}`}
                            onClick={(e) => handleEventClick(event, e)}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className={styles.moreEvents}>
                            +{dayEvents.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Event Modal */}
        <EventModal
  isOpen={isModalOpen}
  onClose={() => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  }}
  event={selectedEvent}
  onSave={handleSaveEvent}
  onDelete={handleDeleteEvent}
  allEvents={events}  // 전체 Event 객체 전달 (간소화된 버전 말고!)
/>
      </div>
    </div>
  );
});

export default Calendar;