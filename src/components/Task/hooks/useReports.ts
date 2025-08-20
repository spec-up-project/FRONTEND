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
      
      // 서버 응답 데이터를 WeeklyReport 타입으로 변환
      const normalizeStatus = (rawStatus: any): 'REQUEST' | 'COMPLETE' | 'ERROR' => {
        const status = String(rawStatus || '').toUpperCase();
        if (status === 'REQUEST' || status === 'REQUESTING' || status === 'PENDING' || status === 'IN_PROGRESS') return 'REQUEST';
        if (status === 'COMPLETE' || status === 'COMPLETED' || status === 'DONE' || status === 'SUCCESS') return 'COMPLETE';
        if (status === 'ERROR' || status === 'FAILED' || status === 'FAIL') return 'ERROR';
        // 기본값: 완료로 처리
        return 'COMPLETE';
      };

      const mappedReports = (result || []).map((item: any) => ({
        id: item.reportUid || item.id || Date.now().toString(),
        title: item.title || '제목 없음',
        date: item.createdAt || item.date || new Date().toISOString().split('T')[0],
        status: normalizeStatus(item.status),
        type: item.type || 'summary' // 기본값을 summary로 설정
      }));
      
      console.log('📋 매핑된 리포트 데이터:', mappedReports);
      setReports(mappedReports);
      
    } catch (error: any) {
      console.error('💥 리포트 데이터 가져오기 실패:', error);
      console.error('💥 에러 상세 정보:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      setError(error.message || '리포트를 불러오는데 실패했습니다.');
      
        
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
        status: 'COMPLETE',
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
