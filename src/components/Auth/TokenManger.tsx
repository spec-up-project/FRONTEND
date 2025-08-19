// auth/tokenManager.ts
export interface AuthTokens {
  accessToken: string;
  userName: string;
  email: string;
  refreshToken?: string; // refreshToken 추가
}

export interface LoginResponse {
  token: string; // accessToken -> token으로 변경
  userName: string;
  email: string;
  // refreshToken은 HttpOnly Cookie로 자동 설정됨
}

class TokenManager {
  private readonly ACCESS_TOKEN_KEY = 'neekly_access_token';
  private readonly USER_INFO_KEY = 'neekly_user_info';

  // 메모리에만 저장 (보안 강화)
  private tokens: AuthTokens | null = null;

  constructor() {
    // 앱 시작 시 메모리에서 토큰 복원 (refreshToken은 HttpOnly Cookie에서 자동 처리)
    this.loadTokensFromStorage();
  }

  // localStorage에서 토큰 로드 (Access Token만)
  private loadTokensFromStorage(): void {
    try {
      const accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      const userInfoStr = localStorage.getItem(this.USER_INFO_KEY);

      if (accessToken && userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        this.tokens = {
          accessToken,
          userName: userInfo.userName,
          email: userInfo.email
        };
        console.log('🔄 메모리에서 토큰 복원 완료');
      }
    } catch (error) {
      console.error('❌ 메모리에서 토큰 복원 실패:', error);
      this.clearTokens();
    }
  }

  // 로그인 성공 시 토큰 저장
  setTokens(tokens: AuthTokens): void {
    this.tokens = tokens;
    this.saveTokensToStorage(tokens);
    console.log('✅ 토큰 저장 완료:', {
      accessToken: tokens.accessToken.substring(0, 20) + '...',
      userName: tokens.userName,
      email: tokens.email
    });
  }

  // localStorage에 토큰 저장 (Access Token만)
  private saveTokensToStorage(tokens: AuthTokens): void {
    try {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(this.USER_INFO_KEY, JSON.stringify({
        userName: tokens.userName,
        email: tokens.email
      }));
      
      // refreshToken도 저장 (토큰 갱신 시 사용)
      if (tokens.refreshToken) {
        localStorage.setItem('neekly_refresh_token', tokens.refreshToken);
      }
    } catch (error) {
      console.error('❌ localStorage에 토큰 저장 실패:', error);
    }
  }

  // localStorage에서 토큰 제거
  private clearTokensFromStorage(): void {
    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.USER_INFO_KEY);
      localStorage.removeItem('neekly_refresh_token');
    } catch (error) {
      console.error('❌ localStorage에서 토큰 제거 실패:', error);
    }
  }

  // 액세스 토큰 가져오기
  getAccessToken(): string | null {
    return this.tokens?.accessToken || null;
  }

  // 사용자 정보 가져오기
  getUserInfo(): { userName: string; email: string } | null {
    if (!this.tokens) return null;
    return {
      userName: this.tokens.userName,
      email: this.tokens.email
    };
  }

  // 로그인 상태 확인
  isLoggedIn(): boolean {
    return this.tokens !== null && this.tokens.accessToken !== '';
  }

  // 로그아웃 (토큰 제거)
  clearTokens(): void {
    console.log('🗑️ TokenManager clearTokens 시작');
    console.log('현재 토큰 상태:', this.tokens ? '토큰 존재' : '토큰 없음');
    
    this.tokens = null;
    this.clearTokensFromStorage();
    
    console.log('✅ 토큰 제거 완료 - 로그아웃');
  }

  // JWT 토큰 디코딩 (만료시간 확인용)
  private decodeJWT(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      console.error('JWT 디코딩 실패:', error);
      return null;
    }
  }

  // 토큰 만료 확인
  isAccessTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    const decoded = this.decodeJWT(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  }

  // 토큰 자동 갱신이 필요한지 확인 (만료 5분 전)
  needsRefresh(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    const decoded = this.decodeJWT(token);
    if (!decoded || !decoded.exp) return false;

    const currentTime = Date.now() / 1000;
    const fiveMinutes = 5 * 60; // 5분
    return decoded.exp - currentTime < fiveMinutes;
  }
}

// 싱글톤 인스턴스
export const tokenManager = new TokenManager();

// auth/authAPI.ts
import { API_CONFIG } from '../../config/api';

export class AuthAPI {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // 로그인 API (credentials: include로 HttpOnly Cookie 자동 포함)
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('🔐 로그인 요청:', { email, passwordLength: password.length });

      const response = await fetch(`${this.baseURL}/api/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // HttpOnly Cookie 포함
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`로그인 실패: ${response.status}`);
      }

      const data: LoginResponse = await response.json();
      
      // Access Token만 저장 (Refresh Token은 HttpOnly Cookie에서 자동 처리)
      tokenManager.setTokens({
        accessToken: data.token, // data.accessToken -> data.token으로 변경
        userName: data.userName,
        email: data.email
      });

      console.log('🎉 로그인 성공:', {
        userName: data.userName,
        email: data.email,
        hasAccessToken: !!data.token
      });

      return data;
    } catch (error) {
      console.error('💥 로그인 API 오류:', error);
      throw error;
    }
  }

  // 토큰 갱신 API - 서버 응답 구조에 맞게 수정
  async refreshToken(): Promise<LoginResponse> {
    try {
      console.log('🔄 토큰 갱신 요청');

      // 현재 저장된 refreshToken 가져오기 (localStorage에서)
      const refreshToken = localStorage.getItem('neekly_refresh_token');
      
      if (!refreshToken) {
        throw new Error('Refresh token이 없습니다');
      }

      const response = await fetch(`${this.baseURL}/api/user/reissue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`토큰 갱신 실패: ${response.status}`);
      }

      // 서버 응답이 문자열 형태의 새로운 access token
      const newAccessToken = await response.text();
      
      // 현재 사용자 정보 가져오기
      const currentUser = tokenManager.getUserInfo();
      if (!currentUser) {
        throw new Error('사용자 정보를 찾을 수 없습니다');
      }

      // 새로운 Access Token 저장
      tokenManager.setTokens({
        accessToken: newAccessToken,
        userName: currentUser.userName,
        email: currentUser.email
      });

      console.log('✅ 토큰 갱신 성공');
      
      // LoginResponse 형태로 반환
      return {
        token: newAccessToken,
        userName: currentUser.userName,
        email: currentUser.email
      };
    } catch (error) {
      console.error('💥 토큰 갱신 실패:', error);
      tokenManager.clearTokens(); // 갱신 실패 시 로그아웃
      throw error;
    }
  }

  // 로그아웃 API (서버에서 HttpOnly Cookie 제거)
  async logout(): Promise<void> {
    console.log('🌐 AuthAPI logout 시작');
    const logoutUrl = `${this.baseURL}${API_CONFIG.ENDPOINTS.LOGOUT}`;
    console.log('로그아웃 URL:', logoutUrl);
    
    try {
      console.log('📡 서버에 로그아웃 요청 전송 중...');
      const response = await fetch(logoutUrl, {
        method: 'POST',
        credentials: 'include', // HttpOnly Cookie 포함하여 서버에서 제거
      });

      console.log('📋 서버 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        console.warn('⚠️ 로그아웃 API 응답 오류:', response.status);
      } else {
        console.log('✅ 서버 로그아웃 성공');
      }
    } catch (error) {
      console.error('❌ 로그아웃 API 오류 (무시):', error);
    } finally {
      console.log('🗑️ 로컬 토큰 제거 시작');
      tokenManager.clearTokens();
      console.log('🚪 로그아웃 완료');
    }
  }
}

// auth/authService.ts
export class AuthService {
  private authAPI: AuthAPI;

  constructor(baseURL: string) {
    this.authAPI = new AuthAPI(baseURL);
  }

  // 로그인
  async login(email: string, password: string): Promise<LoginResponse> {
    return await this.authAPI.login(email, password);
  }

  // 로그아웃
  async logout(): Promise<void> {
    await this.authAPI.logout();
  }

  // 현재 사용자 정보
  getCurrentUser() {
    return tokenManager.getUserInfo();
  }

  // 로그인 상태 확인
  isAuthenticated(): boolean {
    return tokenManager.isLoggedIn() && !tokenManager.isAccessTokenExpired();
  }

  // 인증된 API 요청을 위한 헤더 생성
  getAuthHeaders(): Record<string, string> {
    const token = tokenManager.getAccessToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // 자동 토큰 갱신 체크
  async checkAndRefreshToken(): Promise<void> {
    if (tokenManager.needsRefresh()) {
      try {
        await this.authAPI.refreshToken();
      } catch (error) {
        // 갱신 실패 시 로그아웃 처리
        await this.logout();
        throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
      }
    }
  }
}

// HTTP 인터셉터 - 모든 API 요청에 자동으로 토큰 추가 및 credentials 포함
export class AuthenticatedAPIClient {
  private authService: AuthService;
  private baseURL: string;

  constructor(baseURL: string, authService: AuthService) {
    this.baseURL = baseURL;
    this.authService = authService;
  }

  async request(url: string, options: RequestInit = {}): Promise<Response> {
    // 토큰 갱신 체크
    if (this.authService.isAuthenticated()) {
      await this.authService.checkAndRefreshToken();
    }

    // 기본 헤더 설정
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // 인증 헤더 추가
    if (this.authService.isAuthenticated()) {
      const authHeaders = this.authService.getAuthHeaders();
      Object.assign(headers, authHeaders);
    }

    // credentials: include로 HttpOnly Cookie 자동 포함
    const requestOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // 모든 요청에 HttpOnly Cookie 포함
    };

    const response = await fetch(`${this.baseURL}${url}`, requestOptions);

    // 401 에러 시 자동 로그아웃
    if (response.status === 401) {
      console.warn('🚫 인증 실패 - 자동 로그아웃');
      await this.authService.logout();
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }

    return response;
  }
}

// 사용 예시
export const authService = new AuthService('http://192.168.45.219:8081');
export const apiClient = new AuthenticatedAPIClient('http://192.168.45.219:8081', authService);

