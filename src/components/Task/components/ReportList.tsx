import React from 'react';
import type { WeeklyReport } from '../types';
import styles from './ReportList.module.css';

interface ReportListProps {
  reports: WeeklyReport[];
  isLoading: boolean;
  error: string | null;
  onViewReport: (report: WeeklyReport) => void;
  header?: React.ReactNode;
}

const ReportList: React.FC<ReportListProps> = ({ 
  reports, 
  isLoading, 
  error, 
  onViewReport,
  header
}) => {
  const getStatusColor = (status: string) => {
    return status === 'completed' ? '#10b981' : '#f59e0b';
  };

  const getStatusText = (status: string) => {
    return status === 'completed' ? '완료' : '작성중';
  };

  const getTypeText = (type: string) => {
    return type === 'record' ? '주간기록리포트' : '주간리포트';
  };

  if (isLoading) {
    return (
      <div className={styles.listSection}>
        {header ? header : <h2 className={styles.sectionTitle}>생성된 리포트</h2>}
        <div className={styles.reportList}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>리포트를 불러오는 중입니다...</h3>
            <p className={styles.emptyDescription}>
              데이터를 불러오는데 시간이 걸릴 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.listSection}>
        {header ? header : <h2 className={styles.sectionTitle}>생성된 리포트</h2>}
        <div className={styles.reportList}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>리포트를 불러오는데 실패했습니다.</h3>
            <p className={styles.emptyDescription}>
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className={styles.listSection}>
        {header ? header : <h2 className={styles.sectionTitle}>생성된 리포트</h2>}
        <div className={styles.reportList}>
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
        </div>
      </div>
    );
  }

  return (
    <div className={styles.listSection}>
      {header ? header : <h2 className={styles.sectionTitle}>생성된 리포트</h2>}
      <div className={styles.reportList}>
        {reports.map((report) => (
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
                onClick={() => onViewReport(report)}
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
        ))}
      </div>
    </div>
  );
};

export default ReportList;
