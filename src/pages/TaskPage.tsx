import React, { useState } from 'react';
import Header from '../components/Header/Header';
import ReportCreateModal from '../components/ReportCreateModal/ReportCreateModal';
import ReportViewModal from '../components/ReportViewModal/ReportViewModal';
import styles from './TaskPage.module.css';

interface WeeklyReport {
  id: string;
  title: string;
  date: string;
  status: 'draft' | 'completed';
  type: 'record' | 'summary';
}

interface TaskPageProps {
  onLogout: () => void;
  user: { email: string; name?: string } | null;
  onBackToPlan?: () => void;
  onCalendarClick?: () => void;
  currentPage?: 'calendar' | 'task';
}

const TaskPage: React.FC<TaskPageProps> = ({ 
  onLogout, 
  user, 
  onBackToPlan, 
  onCalendarClick,
  currentPage = 'task'
}) => {
  const [reports, setReports] = useState<WeeklyReport[]>([
    {
      id: '1',
      title: '2024년 1주차 주간기록리포트',
      date: '2024-01-07',
      status: 'completed',
      type: 'record'
    },
    {
      id: '2',
      title: '2024년 1주차 주간리포트',
      date: '2024-01-07',
      status: 'completed',
      type: 'summary'
    },
    {
      id: '3',
      title: '2024년 2주차 주간기록리포트',
      date: '2024-01-14',
      status: 'draft',
      type: 'record'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalType, setModalType] = useState<'record' | 'summary'>('record');
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);

  const handleCreateRecordReport = () => {
    setModalType('record');
    setShowCreateModal(true);
  };

  const handleCreateSummaryReport = () => {
    setModalType('summary');
    setShowCreateModal(true);
  };

  const handleCreateReport = (startDate: string, endDate: string, type: 'record' | 'summary') => {
    const newReport: WeeklyReport = {
      id: Date.now().toString(),
      title: `${startDate} ~ ${endDate} ${type === 'record' ? '주간기록리포트' : '주간리포트'}`,
      date: startDate,
      status: 'draft',
      type: type
    };
    setReports([newReport, ...reports]);
    setShowCreateModal(false);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleViewReport = (report: WeeklyReport) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedReport(null);
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? '#10b981' : '#f59e0b';
  };

  const getStatusText = (status: string) => {
    return status === 'completed' ? '완료' : '작성중';
  };

  const getTypeText = (type: string) => {
    return type === 'record' ? '주간기록리포트' : '주간리포트';
  };

  return (
    <div className={styles.container}>
      <Header 
        onLogout={onLogout} 
        user={user} 
        onTaskClick={onBackToPlan}
        onCalendarClick={onCalendarClick}
        currentPage={currentPage}
      />
      
      <div className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Task Management</h1>
            <p className={styles.subtitle}>주간리포트 생성 및 관리</p>
          </div>
          <button 
            onClick={handleCreateRecordReport}
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
        </div>
        
        {/* 리포트 리스트 섹션 */}
        <div className={styles.listSection}>
          <h2 className={styles.sectionTitle}>생성된 리포트</h2>
          <div className={styles.reportList}>
            {reports.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className={styles.emptyTitle}>아직 생성된 리포트가 없습니다</h3>
                <p className={styles.emptyDescription}>
                  위의 버튼을 클릭하여 첫 번째 리포트를 생성해보세요
                </p>
              </div>
            ) : (
              reports.map((report) => (
                <div key={report.id} className={styles.reportItem}>
                  <div className={styles.reportInfo}>
                    <div className={styles.reportHeader}>
                      <h3 className={styles.reportTitle}>{report.title}</h3>
                      <span 
                        className={styles.reportStatus}
                        style={{ backgroundColor: getStatusColor(report.status) }}
                      >
                        {getStatusText(report.status)}
                      </span>
                    </div>
                    <div className={styles.reportMeta}>
                      <span className={styles.reportType}>{getTypeText(report.type)}</span>
                      <span className={styles.reportDate}>{report.date}</span>
                    </div>
                  </div>
                  <div className={styles.reportActions}>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleViewReport(report)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      보기
                    </button>
                    <button className={styles.actionButton}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      편집
                    </button>
                    <button className={styles.actionButton}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      삭제
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 리포트 생성 모달 */}
      {showCreateModal && (
        <ReportCreateModal
          isOpen={showCreateModal}
          onClose={handleCloseCreateModal}
          onCreateReport={handleCreateReport}
          type={modalType}
        />
      )}

      {/* 리포트 보기 모달 */}
      {showViewModal && (
        <ReportViewModal
          isOpen={showViewModal}
          onClose={handleCloseViewModal}
          report={selectedReport}
        />
      )}
    </div>
  );
};

export default TaskPage; 