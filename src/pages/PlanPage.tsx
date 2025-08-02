import React from 'react';
import Header from '../components/Header/Header';
import Calendar from '../components/Calendar/Calendar';
import Chat from '../components/Chat/Chat';
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
        <Calendar />
        <Chat />
      </div>
    </div>
  );
};

export default PlanPage;
