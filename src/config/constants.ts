// API 설정 상수들 - 순환 참조 방지를 위해 분리
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://192.168.45.219:8081',
  ENDPOINTS: {
    // 인증 관련 (토큰 불필요)
    SIGNUP: '/api/user/register',
    LOGIN: '/api/user/login',
    LOGOUT: '/api/user/logout',
    
    // 인증 필요한 API들
    UPDATE_TASK: '/api/schedule',
    INSERT_SCHEDULE_MANUAL: '/api/schedule/manual/insert',
    UPDATE_SCHEDULE_MANUAL: '/api/schedule/manual/update',
    DELETE_SCHEDULE_MANUAL: '/api/schedule/manual/delete', // 🔥 추가: 수동 삭제 엔드포인트
    
    UPDATE_SCHEDULE: '/api/schedule',
    CREATE_SCHEDULE: '/api/schedule/auto',
    DELETE_SCHEDULE: '/api/schedule',
    
    GET_SCHEDULES: '/api/schedule/manual/calendar',

    GET_SCHEDULE_DETAIL: '/api/report/detail',
    
    // 리포트 관련 API들
    WEEKLY_REPORTS: '/api/report',
    CREATE_REPORT: '/api/reports/create',
  },
};
