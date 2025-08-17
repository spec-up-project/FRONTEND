import React from 'react';
import styles from './TaskHeader.module.css';

interface TaskHeaderProps {
  onCreateRecordReport?: () => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ onCreateRecordReport }) => {
  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>Task Management</h1>
        <p className={styles.subtitle}>주간리포트 생성 및 관리</p>
      </div>
      {onCreateRecordReport && (
        <button 
          onClick={onCreateRecordReport}
          className={styles.createButton}
        >
          <div className={styles.buttonIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div className={styles.buttonContent}>
            <span className={styles.buttonTitle}>주간기록리포트 생성</span>
            <span className={styles.buttonDescription}>일일 기록을 바탕으로 주간기록리포트를 생성합니다</span>
          </div>
        </button>
      )}
    </div>
  );
};

export default TaskHeader;
