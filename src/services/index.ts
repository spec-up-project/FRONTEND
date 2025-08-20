// 서비스 인스턴스 초기화 - 순환 참조 방지
import { AuthService, AuthenticatedAPIClient } from '../components/Auth/TokenManger';
import { API_CONFIG } from '../config/constants';

// 인증 서비스 인스턴스
export const authService = new AuthService(API_CONFIG.BASE_URL);

// 인증된 API 클라이언트 인스턴스
export const apiClient = new AuthenticatedAPIClient(API_CONFIG.BASE_URL, authService);

// 다른 서비스들도 여기에 추가 가능
