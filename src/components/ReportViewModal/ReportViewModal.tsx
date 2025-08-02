import React from 'react';
import styles from './ReportViewModal.module.css';

interface Issue {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'resolved';
}

interface ReportViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: {
    id: string;
    title: string;
    date: string;
    type: 'record' | 'summary';
  } | null;
}

const ReportViewModal: React.FC<ReportViewModalProps> = ({
  isOpen,
  onClose,
  report
}) => {
  // 샘플 데이터
  const majorIssues: Issue[] = [
    {
      id: '1',
      title: '프로젝트 일정 지연',
      description: '개발 환경 설정으로 인한 2일 지연 발생',
      priority: 'high',
      status: 'in-progress'
    },
    {
      id: '2',
      title: '팀원 이직',
      description: '주요 개발자 1명 이직으로 인한 인력 부족',
      priority: 'high',
      status: 'open'
    },
    {
      id: '3',
      title: '예산 초과',
      description: '외부 라이브러리 구매로 인한 예산 10% 초과',
      priority: 'medium',
      status: 'resolved'
    }
  ];

  const minorIssues: Issue[] = [
    {
      id: '4',
      title: '코드 리뷰 지연',
      description: 'PR 리뷰가 평균 3일 지연되고 있음',
      priority: 'medium',
      status: 'open'
    },
    {
      id: '5',
      title: '문서화 부족',
      description: 'API 문서 업데이트가 필요함',
      priority: 'low',
      status: 'open'
    },
    {
      id: '6',
      title: '테스트 커버리지 부족',
      description: '현재 테스트 커버리지 60%로 목표 80% 미달',
      priority: 'medium',
      status: 'in-progress'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return '높음';
      case 'medium':
        return '보통';
      case 'low':
        return '낮음';
      default:
        return '미정';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#6b7280';
      case 'in-progress':
        return '#3b82f6';
      case 'resolved':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return '대기중';
      case 'in-progress':
        return '진행중';
      case 'resolved':
        return '해결됨';
      default:
        return '미정';
    }
  };

  const handleExportExcel = () => {
    // 엑셀 내보내기 로직 (실제 구현 시 xlsx 라이브러리 사용)
    alert('엑셀 파일이 다운로드됩니다.');
  };

  if (!isOpen || !report) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleSection}>
            <h2 className={styles.modalTitle}>{report.title}</h2>
            <div className={styles.modalMeta}>
              <span className={styles.reportType}>
                {report.type === 'record' ? '주간기록리포트' : '주간리포트'}
              </span>
              <span className={styles.reportDate}>{report.date}</span>
            </div>
          </div>
          <button className={styles.modalCloseButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.modalContent}>
          {/* 대분류 이슈 섹션 */}
          <div className={styles.issueSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>대분류 이슈</h3>
              <span className={styles.issueCount}>{majorIssues.length}개</span>
            </div>
            <div className={styles.issueList}>
              {majorIssues.map((issue) => (
                <div key={issue.id} className={styles.issueItem}>
                  <div className={styles.issueHeader}>
                    <h4 className={styles.issueTitle}>{issue.title}</h4>
                    <div className={styles.issueBadges}>
                      <span 
                        className={styles.priorityBadge}
                        style={{ backgroundColor: getPriorityColor(issue.priority) }}
                      >
                        {getPriorityText(issue.priority)}
                      </span>
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(issue.status) }}
                      >
                        {getStatusText(issue.status)}
                      </span>
                    </div>
                  </div>
                  <p className={styles.issueDescription}>{issue.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 중분류 이슈 섹션 */}
          <div className={styles.issueSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>중분류 이슈</h3>
              <span className={styles.issueCount}>{minorIssues.length}개</span>
            </div>
            <div className={styles.issueList}>
              {minorIssues.map((issue) => (
                <div key={issue.id} className={styles.issueItem}>
                  <div className={styles.issueHeader}>
                    <h4 className={styles.issueTitle}>{issue.title}</h4>
                    <div className={styles.issueBadges}>
                      <span 
                        className={styles.priorityBadge}
                        style={{ backgroundColor: getPriorityColor(issue.priority) }}
                      >
                        {getPriorityText(issue.priority)}
                      </span>
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(issue.status) }}
                      >
                        {getStatusText(issue.status)}
                      </span>
                    </div>
                  </div>
                  <p className={styles.issueDescription}>{issue.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.exportButton} onClick={handleExportExcel}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            엑셀 다운로드
          </button>
          <button className={styles.closeButton} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportViewModal; 