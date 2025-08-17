import { useState, useEffect } from 'react';
import { API_CONFIG, authenticatedApiRequest } from '../../../config/api';
import type { WeeklyReport } from '../types';

export const useReports = () => {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 리포트 데이터 가져오기 (인증된 API 요청)
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📊 리포트 데이터 가져오기 시작');
      
      // 인증된 API 요청 - 자동으로 토큰 포함
      const result = await authenticatedApiRequest(API_CONFIG.ENDPOINTS.WEEKLY_REPORTS, {
        method: 'GET',
      });
      
      console.log('✅ 리포트 데이터 가져오기 성공:', result);
      setReports(result.reports || []);
      
    } catch (error: any) {
      console.error('💥 리포트 데이터 가져오기 실패:', error);
      setError(error.message || '리포트를 불러오는데 실패했습니다.');
      
      // 개발 환경에서는 더미 데이터 사용
      if (import.meta.env.DEV) {
        console.log('🔄 개발 환경 - 더미 데이터 사용');
        setReports([
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
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 리포트 생성 API 호출
  const createReport = async (startDate: string, endDate: string, type: 'record' | 'summary') => {
    try {
      console.log('📝 리포트 생성 시작:', { startDate, endDate, type });
      
      // 인증된 API 요청으로 리포트 생성
      const result = await authenticatedApiRequest(API_CONFIG.ENDPOINTS.CREATE_REPORT, {
        method: 'POST',
        body: JSON.stringify({
          startDate,
          endDate,
          type,
          title: `${startDate} ~ ${endDate} ${type === 'record' ? '주간기록리포트' : '주간리포트'}`
        }),
      });
      
      console.log('✅ 리포트 생성 성공:', result);
      
      // 새로 생성된 리포트를 목록에 추가
      const newReport: WeeklyReport = {
        id: result.id || Date.now().toString(),
        title: result.title || `${startDate} ~ ${endDate} ${type === 'record' ? '주간기록리포트' : '주간리포트'}`,
        date: startDate,
        status: 'draft',
        type: type
      };
      
      setReports([newReport, ...reports]);
      return newReport;
      
    } catch (error: any) {
      console.error('💥 리포트 생성 실패:', error);
      throw new Error(error.message || '리포트 생성에 실패했습니다.');
    }
  };

  // 컴포넌트 마운트 시 리포트 데이터 가져오기
  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    isLoading,
    error,
    fetchReports,
    createReport,
  };
};
