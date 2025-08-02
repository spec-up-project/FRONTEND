import React, { useState } from 'react';
import styles from './Calendar.module.css';

interface Event {
  id: string;
  date: string;
  time: string;
  title: string;
  color: string;
}

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5)); // June 2025
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events] = useState<Event[]>([
    {
      id: '1',
      date: '2025-06-25',
      time: '8:30 AM',
      title: '팀 미팅',
      color: 'blue'
    },
    {
      id: '2',
      date: '2025-06-25',
      time: '10:00 AM',
      title: '프로젝트 리뷰',
      color: 'purple'
    },
    {
      id: '3',
      date: '2025-06-25',
      time: '2:00 PM',
      title: '클라이언트 콜',
      color: 'green'
    },
    {
      id: '4',
      date: '2025-06-25',
      time: '4:00 PM',
      title: '디자인 싱크',
      color: 'pink'
    }
  ]);

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
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
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

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header */}

        {/* Calendar Navigation */}
        <div className={styles.calendarContainer}>
          <div className={styles.navigation}>
            <div className={styles.navigationLeft}>
              <h2 className={styles.monthTitle}>
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
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
                <button className={styles.viewButton}>
                  Day
                </button>
                <button className={styles.viewButton}>
                  Week
                </button>
                <button className={`${styles.viewButton} ${styles.active}`}>
                  Month
                </button>
                <button className={styles.viewButton}>
                  Year
                </button>
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
                const dayEvents = events.filter(event => event.date === dateKey);
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
                    onClick={() => setSelectedDate(day.date)}
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

        {/* Selected Date Events */}
        {selectedDate && (
          <div className={styles.selectedDateContainer}>
            <h3 className={styles.selectedDateTitle}>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            {events.filter(e => e.date === formatDateKey(selectedDate)).length > 0 ? (
              <div className={styles.eventsList}>
                {events.filter(e => e.date === formatDateKey(selectedDate)).map(event => (
                  <div key={event.id} className={styles.eventItem}>
                    <div className={`${styles.eventColor} ${styles[event.color as keyof typeof styles]}`}></div>
                    <div className={styles.eventContent}>
                      <h4 className={styles.eventTitle}>{event.title}</h4>
                      <p className={styles.eventTime}>{event.time}</p>
                    </div>
                    <button className={styles.eventAction}>
                      <svg className={styles.eventActionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noEvents}>No events scheduled</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;