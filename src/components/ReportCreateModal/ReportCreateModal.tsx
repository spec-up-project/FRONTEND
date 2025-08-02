import React, { useState } from 'react';
import styles from './ReportCreateModal.module.css';

interface ReportCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateReport: (startDate: string, endDate: string, type: 'record' | 'summary') => void;
  type: 'record' | 'summary';
}

const ReportCreateModal: React.FC<ReportCreateModalProps> = ({
  isOpen,
  onClose,
  onCreateReport,
  type
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleCreateReport = () => {
    if (!startDate || !endDate) {
      alert('시작일과 종료일을 모두 선택해주세요.');
      return;
    }

    onCreateReport(startDate, endDate, type);
    setStartDate('');
    setEndDate('');
  };

  const handleCloseModal = () => {
    setStartDate('');
    setEndDate('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleCloseModal}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {type === 'record' ? '주간기록리포트' : '주간리포트'} 생성
          </h2>
          <button className={styles.modalCloseButton} onClick={handleCloseModal}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={styles.modalContent}>
          <div className={styles.dateInputGroup}>
            <label className={styles.dateLabel}>시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.dateInputGroup}>
            <label className={styles.dateLabel}>종료일</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.modalCancelButton} onClick={handleCloseModal}>
            취소
          </button>
          <button className={styles.modalCreateButton} onClick={handleCreateReport}>
            생성
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportCreateModal; 