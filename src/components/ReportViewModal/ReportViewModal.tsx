import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { API_CONFIG, authenticatedApiRequest } from '../../config/api';
import type { ScheduleDetail } from '../Task/types';
import styles from './ReportViewModal.module.css';

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
  const [scheduleDetails, setScheduleDetails] = useState<ScheduleDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 스케줄 상세 정보 가져오기
  const fetchScheduleDetails = async (reportUid: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📊 스케줄 상세 정보 가져오기 시작:', reportUid);
      
      // 리포트 ID를 reportUid로 사용하여 상세 정보 조회
      const result = await authenticatedApiRequest(
        `${API_CONFIG.ENDPOINTS.GET_SCHEDULE_DETAIL}/${reportUid}`,
        {
          method: 'GET',
        }
      );
      
      console.log('✅ 스케줄 상세 정보 가져오기 성공:', result);
      
      // null 체크 추가
      if (!result) {
        console.log('⚠️ 서버에서 빈 응답을 받았습니다.');
        setScheduleDetails([]);
        return;
      }
      
      // 응답이 배열인지 단일 객체인지 확인
      const details = Array.isArray(result) ? result : [result];
      setScheduleDetails(details);
      
    } catch (error: unknown) {
      console.error('💥 스케줄 상세 정보 가져오기 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '스케줄 상세 정보를 불러오는데 실패했습니다.';
      setError(errorMessage);
      setScheduleDetails([]); // 에러 시 빈 배열로 설정
    } finally {
      setIsLoading(false);
    }
  };

  // 모달이 열릴 때 스케줄 상세 정보 가져오기
  useEffect(() => {
    if (isOpen && report) {
      console.log(report)
      console.log(report.id)
      fetchScheduleDetails(report.id);
    }
  }, [isOpen, report]);

  

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
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
          {isLoading && (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner}></div>
              <p>스케줄 정보를 불러오는 중...</p>
            </div>
          )}

          {error && (
            <div className={styles.errorState}>
              <p className={styles.errorMessage}>{error}</p>
            </div>
          )}

          {!isLoading && !error && scheduleDetails.length > 0 && (
            <div className={styles.scheduleSection}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>스케줄 상세 정보</h3>
                <span className={styles.scheduleCount}>{scheduleDetails.length}개</span>
              </div>
              <div className={styles.scheduleList}>
                {scheduleDetails.map((schedule) => (
                  <div key={schedule.scheduleUid} className={styles.scheduleItem}>
                    <div className={styles.scheduleHeader}>
                      <h4 className={styles.scheduleTitle}>{schedule.title || '제목 없음'}</h4>
                      <div className={styles.scheduleBadges}>
                        <span className={styles.categoryBadge}>
                          {schedule.mainCategory || '카테고리 없음'}
                        </span>
                        {schedule.subCategory && (
                          <span className={styles.subCategoryBadge}>
                            {schedule.subCategory}
                          </span>
                        )}
                        {schedule.isAllDay && (
                          <span className={styles.allDayBadge}>종일</span>
                        )}
                      </div>
                    </div>
                    


                    {schedule.content && (
                      <div className={styles.contentSection}>
                        <h5 className={styles.contentTitle}>내용</h5>
                        <div className={styles.contentText}>
                          <ReactMarkdown>{schedule.content}</ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {schedule.rawText && (
                      <div className={styles.rawTextSection}>
                        <h5 className={styles.rawTextTitle}>원본 텍스트</h5>
                        <div className={styles.rawTextContent}>
                          <ReactMarkdown>{schedule.rawText}</ReactMarkdown>
                        </div>
                      </div>
                    )}

                    <div className={styles.metaInfo}>
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>생성일:</span>
                        <span className={styles.metaValue}>
                          {schedule.createDate ? formatDate(schedule.createDate) : '날짜 정보 없음'}
                        </span>
                      </div>
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>수정일:</span>
                        <span className={styles.metaValue}>
                          {schedule.modifyDate ? formatDate(schedule.modifyDate) : '날짜 정보 없음'}
                        </span>
                      </div>
                      {schedule.source && (
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>출처:</span>
                          <span className={styles.metaValue}>{schedule.source}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isLoading && !error && scheduleDetails.length === 0 && (
            <div className={styles.emptyState}>
              <p>해당 리포트에 연결된 스케줄이 없습니다.</p>
              <p className={styles.emptySubText}>
                서버에서 스케줄 정보를 찾을 수 없거나, 아직 스케줄이 생성되지 않았습니다.
              </p>
            </div>
          )}
        </div>

        <div className={styles.modalActions}>
          <button className={styles.closeButton} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportViewModal; 