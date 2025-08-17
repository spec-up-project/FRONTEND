import React, { useState } from 'react';
import Header from '../components/Header/Header';
// ReportCreateModal 제거
import ReportViewModal from '../components/ReportViewModal/ReportViewModal';
import { TaskHeader, ReportList, useReports, WeeklyScheduleCreator } from '../components/Task';
import type { TaskPageProps, WeeklyReport } from '../components/Task';
import styles from './TaskPage.module.css';

const TaskPage: React.FC<TaskPageProps> = ({ 
  onLogout, 
  user, 
  onBackToPlan, 
  onCalendarClick,
  currentPage = 'task'
}) => {
  const { reports, isLoading, error } = useReports();
  
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);

  // 리포트 생성 모달 제거 -> ScheduleCreator 사용

  const handleViewReport = (report: WeeklyReport) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedReport(null);
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

        <div className={styles.contentRow}>
          <div className={styles.leftPane}>
            <div className={styles.fillChild}>
              <ReportList 
                reports={reports}
                isLoading={isLoading}
                error={error}
                onViewReport={handleViewReport}
                header={<TaskHeader />}
              />
            </div>
          </div>
          <div className={styles.rightPane}>
            <WeeklyScheduleCreator onScheduleCreated={() => {}} />
          </div>
        </div>
      </div>

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