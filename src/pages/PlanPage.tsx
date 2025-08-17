import React from 'react';
import Header from '../components/Header/Header';
import Calendar from '../components/Calendar/Calendar';
import type { CalendarRef } from '../components/Calendar/Calendar';
import ScheduleCreator from '../components/Chat/ScheduleCreator';
import styles from '../App.module.css';

interface PlanPageProps {
  onLogout: () => void;
  user: { email: string; name?: string } | null;
  onTaskClick: () => void;
  onCalendarClick?: () => void;
  currentPage?: 'calendar' | 'task';
}

const PlanPage: React.FC<PlanPageProps> = ({ 
  onLogout, 
  user, 
  onTaskClick, 
  onCalendarClick,
  currentPage = 'calendar'
}) => {
  // 캘린더 새로고침 함수를 위한 ref
  const calendarRef = React.useRef<{ fetchSchedules: () => void } | null>(null);

  // 스케줄 생성 완료 후 캘린더 새로고침
  const handleScheduleCreated = () => {
    console.log('🔄 스케줄 생성 완료 - 캘린더 새로고침 시작');
    if (calendarRef.current) {
      calendarRef.current.fetchSchedules();
    }
  };

  return (
    <div className={styles.app}>
      <Header 
        onLogout={onLogout} 
        user={user} 
        onTaskClick={onTaskClick}
        onCalendarClick={onCalendarClick}
        currentPage={currentPage}
      />
      <div className={styles.main}>
        <Calendar ref={calendarRef} />
        <ScheduleCreator onScheduleCreated={handleScheduleCreated} />
      </div>
    </div>
  );
};

export default PlanPage;
