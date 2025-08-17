// API 설정
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://192.168.45.219:8081',
  ENDPOINTS: {
    // 인증 관련 (토큰 불필요)
    SIGNUP: '/api/user/register',
    LOGIN: '/api/user/login',
    LOGOUT: '/api/user/logout',
    
    // 인증 필요한 API들
    CREATE_TASK: '/api/schedule',
    UPDATE_TASK: '/api/schedule',
    GET_SCHEDULES: '/api/schedule/manual/calendar',
    
    // 리포트 관련 API들
    WEEKLY_REPORTS: '/api/reports/weekly',
    CREATE_REPORT: '/api/reports/create',
  },
};

// TokenManager import
import { tokenManager, authService } from '../components/Auth/TokenManger';

// 디버깅을 위한 로깅 함수
const logApiRequest = (url: string, options: RequestInit) => {
  console.log('🚀 API 요청 시작:', {
    url,
    method: options.method,
    headers: options.headers,
    credentials: options.credentials,
    body: options.body ? JSON.parse(options.body as string) : undefined,
    timestamp: new Date().toISOString(),
  });
};

const logApiResponse = (response: Response, data: any) => {
  console.log('✅ API 응답 성공:', {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    data,
    timestamp: new Date().toISOString(),
  });
};

const logApiError = (error: any, url: string) => {
  console.error('❌ API 요청 실패:', {
    url,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
};

// 네트워크 상태 확인 함수
export const checkNetworkStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      credentials: 'include', // HttpOnly Cookie 포함
    });
    console.log('🌐 서버 연결 상태 확인:', response.status);
    return true;
  } catch (error) {
    console.error('🌐 서버 연결 실패:', error);
    return false;
  }
};

// API 요청 타임아웃 설정
const createTimeoutPromise = (timeout: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`요청 시간 초과 (${timeout}ms)`));
    }, timeout);
  });
};

// 토큰 갱신 체크 및 처리
const checkAndRefreshTokenIfNeeded = async (): Promise<void> => {
  if (authService.isAuthenticated() && tokenManager.needsRefresh()) {
    try {
      console.log('🔄 토큰 갱신 필요 - 자동 갱신 시작');
      await authService.checkAndRefreshToken();
      console.log('✅ 토큰 갱신 완료');
    } catch (error) {
      console.error('💥 토큰 갱신 실패:', error);
      // 갱신 실패 시 로그아웃 처리
      await authService.logout();
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
  }
};

// API 헬퍼 함수들 - 토큰 자동 포함
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  timeout: number = 10000 // 10초 타임아웃
): Promise<any> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // 토큰 갱신 체크 (로그인/회원가입 제외)
  if (!endpoint.includes('/login') && !endpoint.includes('/register')) {
    await checkAndRefreshTokenIfNeeded();
  }
  
  // 기본 헤더 설정
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 인증 헤더 자동 추가 (로그인/회원가입 제외)
  if (!endpoint.includes('/login') && !endpoint.includes('/register') && authService.isAuthenticated()) {
    try {
      const authHeaders = authService.getAuthHeaders();
      Object.assign(headers, authHeaders);
      console.log('🔐 인증 헤더 자동 추가됨');
    } catch (error) {
      console.warn('⚠️ 인증 토큰 없음 - 인증되지 않은 요청');
    }
  }
  
  const defaultOptions: RequestInit = {
    headers,
    credentials: 'include', // HttpOnly Cookie 자동 포함
    ...options,
  };

  // 요청 로깅
  logApiRequest(url, defaultOptions);

  try {
    // 타임아웃과 함께 요청 실행
    const response = await Promise.race([
      fetch(url, defaultOptions),
      createTimeoutPromise(timeout)
    ]);
    
    console.log('📡 서버 응답 상태:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url,
    });

    // 응답 헤더 로깅
    console.log('📋 응답 헤더:', Object.fromEntries(response.headers.entries()));
    
    // 401 에러 시 자동 로그아웃
    if (response.status === 401) {
      console.warn('🚫 인증 실패 - 자동 로그아웃');
      await authService.logout();
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }
    
    if (!response.ok) {
      // 에러 응답 본문 읽기 시도
      let errorData;
      let errorText;
      try {
        errorData = await response.json();
        console.log('⚠️ 에러 응답 데이터:', errorData);
      } catch (parseError) {
        console.log('⚠️ 에러 응답 파싱 실패:', parseError);
        try {
          errorText = await response.text();
          console.log('⚠️ 에러 응답 텍스트:', errorText);
        } catch (textError) {
          console.log('⚠️ 에러 응답 텍스트 읽기 실패:', textError);
        }
        errorData = {};
      }
      
      // 더 자세한 에러 정보 구성
      const errorMessage = errorData.message || 
                          errorData.error || 
                          errorText || 
                          `HTTP error! status: ${response.status}`;
      
      const detailedError = new Error(errorMessage);
      (detailedError as any).status = response.status;
      (detailedError as any).response = errorData;
      (detailedError as any).responseText = errorText;
      
      throw detailedError;
    }

    // 성공 응답 파싱
    let data;
    try {
      data = await response.json();
      logApiResponse(response, data);
    } catch (parseError) {
      console.log('⚠️ 성공 응답 파싱 실패:', parseError);
      data = null;
    }

    return data;
  } catch (error) {
    logApiError(error, url);
    throw error;
  }
};

// 인증이 필요한 API 요청을 위한 헬퍼 함수
export const authenticatedApiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  timeout: number = 10000
): Promise<any> => {
  // 인증 상태 확인
  if (!authService.isAuthenticated()) {
    throw new Error('로그인이 필요합니다.');
  }
  
  return await apiRequest(endpoint, options, timeout);
};

// 전역 디버깅 함수 (개발자 도구에서 사용)
if (typeof window !== 'undefined') {
  (window as any).debugAPI = {
    config: API_CONFIG,
    checkNetwork: checkNetworkStatus,
    testSignup: async (email: string, password: string, userName: string) => {
      console.log('🧪 테스트 회원가입 실행');
      return await apiRequest(API_CONFIG.ENDPOINTS.SIGNUP, {
        method: 'POST',
        body: JSON.stringify({ email, password, userName }),
      });
    },
    testSignupWithDetails: async (email: string, password: string, userName: string) => {
      console.log('🧪 상세 테스트 회원가입 실행');
      const requestData = {
        email: email.trim(),
        password: password,
        userName: userName.trim(),
      };
      console.log('📤 전송할 데이터:', { ...requestData, password: '[HIDDEN]' });
      return await apiRequest(API_CONFIG.ENDPOINTS.SIGNUP, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
    },
    testLogin: async (email: string, password: string) => {
      console.log('🧪 테스트 로그인 실행');
      return await apiRequest(API_CONFIG.ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    testAuthenticatedRequest: async (endpoint: string) => {
      console.log('🧪 테스트 인증 요청 실행');
      return await authenticatedApiRequest(endpoint, {
        method: 'GET',
      });
    },
    // 서버 API 스펙 확인용
    testServerSpec: async () => {
      console.log('🔍 서버 API 스펙 확인 시작');
      try {
        // OPTIONS 요청으로 서버 정보 확인
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/user/register`, {
          method: 'OPTIONS',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('📋 서버 응답 헤더:', Object.fromEntries(response.headers.entries()));
        return response;
      } catch (error) {
        console.error('서버 스펙 확인 실패:', error);
        throw error;
      }
    },
  };
  
  console.log('🔧 API 디버깅 도구가 로드되었습니다. 개발자 도구에서 `debugAPI`를 사용하세요.');
} 