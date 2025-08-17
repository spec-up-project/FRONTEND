# Neekly Reports

Neekly Reports는 React, TypeScript, Vite를 사용하여 구축된 현대적인 웹 애플리케이션입니다.

## 주요 기능

- 🔐 사용자 인증 (로그인/회원가입)
- 📅 캘린더 뷰
- 💬 채팅 기능
- 📊 리포트 생성 및 조회
- 📝 태스크 관리

## 🔒 보안 강화 사항

### 토큰 관리 시스템
- **HttpOnly Secure Cookie**: Refresh Token은 HttpOnly Cookie로 안전하게 저장
- **Access Token**: 짧은 만료시간 (15분)으로 메모리에 저장
- **자동 토큰 갱신**: 만료 5분 전 자동 갱신
- **토큰 폐기**: 재발급 시 기존 토큰 자동 폐기

### CORS 설정
- `credentials: include`로 HttpOnly Cookie 자동 포함
- 서버 측 `Access-Control-Allow-Credentials: true` 설정 필요

자세한 서버 설정 가이드는 [SERVER_SETUP_GUIDE.md](./SERVER_SETUP_GUIDE.md)를 참조하세요.

## 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: CSS Modules
- **Build Tool**: Vite
- **Linting**: ESLint
- **Security**: HttpOnly Cookies, CORS with credentials

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 API 기본 URL을 설정하세요:

```env
# API 설정
VITE_API_BASE_URL=http://192.168.45.219:8081

# 개발 환경 설정
VITE_APP_ENV=development
VITE_APP_TITLE=Neekly Reports
```

**중요**: Vite에서 환경 변수를 사용하려면 변수명이 `VITE_`로 시작해야 합니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속하세요.

## API 설정

### 백엔드 API 엔드포인트

애플리케이션은 다음 API 엔드포인트를 사용합니다:

- `POST /api/user/register` - 회원가입
- `POST /api/user/login` - 로그인 (HttpOnly Cookie 설정)
- `POST /api/auth/refresh` - 토큰 갱신 (HttpOnly Cookie 사용)
- `POST /api/auth/logout` - 로그아웃 (HttpOnly Cookie 제거)

### API 설정 파일

API 설정은 `src/config/api.ts` 파일에서 관리됩니다:

```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  ENDPOINTS: {
    SIGNUP: '/api/user/register',
    LOGIN: '/api/user/login',
    LOGOUT: '/api/user/logout',
  },
};
```

### 보안 강화된 API 요청

모든 API 요청은 자동으로 `credentials: 'include'`를 포함하여 HttpOnly Cookie를 전송합니다:

```typescript
// 자동으로 HttpOnly Cookie 포함
const result = await apiRequest(API_CONFIG.ENDPOINTS.LOGIN, {
  method: 'POST',
  body: JSON.stringify(data),
});
```

## 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── Auth/           # 인증 관련 컴포넌트
│   │   ├── TokenManger.tsx  # 보안 강화된 토큰 관리
│   │   ├── Login.tsx        # 로그인 컴포넌트
│   │   └── Signup.tsx       # 회원가입 컴포넌트
│   ├── Calendar/       # 캘린더 컴포넌트
│   ├── Chat/           # 채팅 컴포넌트
│   └── ...
├── pages/              # 페이지 컴포넌트
├── config/             # 설정 파일
│   └── api.ts          # API 설정 (credentials 포함)
└── assets/             # 정적 자산
```

## 빌드

프로덕션 빌드를 위해:

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

## 개발 가이드

### 컴포넌트 추가

새 컴포넌트를 추가할 때는 `src/components` 폴더에 적절한 하위 폴더를 만들어 구성하세요.

### 스타일링

CSS Modules를 사용하여 컴포넌트별 스타일을 관리합니다. 각 컴포넌트 폴더에는 `.module.css` 파일이 있어야 합니다.

### API 호출

API 호출은 `src/config/api.ts`의 `apiRequest` 헬퍼 함수를 사용하세요. 자동으로 `credentials: 'include'`가 포함됩니다:

```typescript
import { apiRequest, API_CONFIG } from '../config/api';

const result = await apiRequest(API_CONFIG.ENDPOINTS.SIGNUP, {
  method: 'POST',
  body: JSON.stringify(data),
});
```

### 토큰 관리

토큰 관리는 `src/components/Auth/TokenManger.tsx`에서 처리됩니다:

```typescript
import { tokenManager, authService } from '../components/Auth/TokenManger';

// 로그인 상태 확인
if (authService.isAuthenticated()) {
  // 인증된 사용자
}

// 사용자 정보 가져오기
const userInfo = tokenManager.getUserInfo();
```

## 보안 체크리스트

- [x] HttpOnly Cookie 사용
- [x] Secure 플래그 설정 (HTTPS 환경)
- [x] SameSite 설정 (CSRF 방지)
- [x] CORS credentials: true 설정
- [x] Access Token 짧은 만료시간 (15분)
- [x] Refresh Token 긴 만료시간 (7일)
- [x] 토큰 재발급 시 기존 토큰 폐기
- [x] 환경 변수로 민감한 정보 관리

## 라이센스

MIT License
