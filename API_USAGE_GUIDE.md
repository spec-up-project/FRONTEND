# API 사용법 가이드

## 🔐 인증된 API 요청 사용법

### 1. 기본 API 요청 (`apiRequest`)

모든 API 요청은 자동으로 토큰을 포함합니다:

```typescript
import { apiRequest, API_CONFIG } from '../config/api';

// 로그인/회원가입 (토큰 불필요)
const loginResult = await apiRequest(API_CONFIG.ENDPOINTS.LOGIN, {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});

// 인증이 필요한 API (자동으로 토큰 포함)
const userProfile = await apiRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, {
  method: 'GET',
});
```

### 2. 인증 필수 API 요청 (`authenticatedApiRequest`)

인증이 반드시 필요한 API의 경우:

```typescript
import { authenticatedApiRequest, API_CONFIG } from '../config/api';

// 인증 상태 확인 후 요청
const reports = await authenticatedApiRequest(API_CONFIG.ENDPOINTS.WEEKLY_REPORTS, {
  method: 'GET',
});

// POST 요청 예시
const newReport = await authenticatedApiRequest(API_CONFIG.ENDPOINTS.CREATE_REPORT, {
  method: 'POST',
  body: JSON.stringify({
    title: '새 리포트',
    content: '리포트 내용',
    type: 'record'
  }),
});
```

### 3. 자동 토큰 갱신

모든 API 요청에서 자동으로 토큰 갱신이 처리됩니다:

```typescript
// 토큰이 만료되면 자동으로 갱신
const data = await apiRequest('/api/protected-endpoint', {
  method: 'GET',
});

// 갱신 실패 시 자동 로그아웃
// 사용자는 다시 로그인해야 함
```

### 4. 실제 사용 예시

#### TaskPage에서 리포트 가져오기

```typescript
import React, { useState, useEffect } from 'react';
import { API_CONFIG, authenticatedApiRequest } from '../config/api';

const TaskPage: React.FC = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      
      // 인증된 API 요청 - 자동으로 토큰 포함
      const result = await authenticatedApiRequest(API_CONFIG.ENDPOINTS.WEEKLY_REPORTS, {
        method: 'GET',
      });
      
      setReports(result.reports || []);
      
    } catch (error) {
      console.error('리포트 가져오기 실패:', error);
      // 에러 처리
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ... 나머지 컴포넌트 로직
};
```

#### Chat 컴포넌트에서 메시지 전송

```typescript
import React, { useState } from 'react';
import { API_CONFIG, authenticatedApiRequest } from '../config/api';

const Chat: React.FC = () => {
  const [message, setMessage] = useState('');

  const handleSendMessage = async (messageText: string) => {
    try {
      // 인증된 API 요청으로 메시지 전송
      const result = await authenticatedApiRequest(API_CONFIG.ENDPOINTS.SEND_MESSAGE, {
        method: 'POST',
        body: JSON.stringify({
          message: messageText,
          timestamp: new Date().toISOString()
        }),
      });
      
      console.log('메시지 전송 성공:', result);
      
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  };

  // ... 나머지 컴포넌트 로직
};
```

### 5. 에러 처리

#### 401 에러 (인증 실패)
```typescript
try {
  const data = await authenticatedApiRequest('/api/protected', {
    method: 'GET',
  });
} catch (error) {
  if (error.message.includes('인증이 만료되었습니다')) {
    // 자동으로 로그아웃 처리됨
    // 사용자를 로그인 페이지로 리다이렉트
    window.location.href = '/login';
  }
}
```

#### 네트워크 에러
```typescript
try {
  const data = await apiRequest('/api/data', {
    method: 'GET',
  });
} catch (error) {
  if (error.message.includes('요청 시간 초과')) {
    // 타임아웃 처리
    alert('요청 시간이 초과되었습니다. 다시 시도해주세요.');
  } else {
    // 기타 네트워크 에러
    alert('네트워크 오류가 발생했습니다.');
  }
}
```

### 6. 개발 환경에서의 처리

개발 환경에서는 서버가 없을 때를 대비한 폴백 처리:

```typescript
const fetchData = async () => {
  try {
    const result = await authenticatedApiRequest('/api/data', {
      method: 'GET',
    });
    setData(result);
  } catch (error) {
    // 개발 환경에서는 더미 데이터 사용
    if (import.meta.env.DEV) {
      console.log('개발 환경 - 더미 데이터 사용');
      setData(mockData);
    } else {
      // 프로덕션에서는 에러 처리
      setError(error.message);
    }
  }
};
```

### 7. API 엔드포인트 목록

#### 인증 불필요
- `POST /api/user/register` - 회원가입
- `POST /api/user/login` - 로그인
- `POST /api/user/logout` - 로그아웃

#### 인증 필요
- `GET /api/user/profile` - 사용자 프로필
- `GET /api/reports/weekly` - 주간 리포트 목록
- `POST /api/reports/create` - 리포트 생성
- `PUT /api/reports/update` - 리포트 수정
- `DELETE /api/reports/delete` - 리포트 삭제
- `GET /api/tasks` - 태스크 목록
- `POST /api/tasks/create` - 태스크 생성
- `PUT /api/tasks/update` - 태스크 수정
- `DELETE /api/tasks/delete` - 태스크 삭제
- `GET /api/chat/messages` - 채팅 메시지 목록
- `POST /api/chat/send` - 메시지 전송

### 8. 디버깅

브라우저 개발자 도구에서 API 디버깅 도구 사용:

```javascript
// 콘솔에서 사용 가능한 디버깅 함수들
debugAPI.testLogin('user@example.com', 'password');
debugAPI.testSignup('user@example.com', 'password', 'UserName');
debugAPI.testAuthenticatedRequest('/api/user/profile');
debugAPI.checkNetwork();
```

### 9. 보안 주의사항

1. **토큰 자동 관리**: 개발자가 직접 토큰을 다룰 필요 없음
2. **HttpOnly Cookie**: Refresh Token은 자동으로 관리됨
3. **자동 갱신**: Access Token 만료 시 자동 갱신
4. **에러 처리**: 401 에러 시 자동 로그아웃

이제 모든 API 요청에서 자동으로 토큰이 포함되며, 개발자는 비즈니스 로직에만 집중할 수 있습니다! 🚀 