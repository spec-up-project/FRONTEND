# 서버 설정 가이드 - HttpOnly Secure Cookie & CORS

## 🔐 보안 강화된 토큰 관리 시스템

### 1. HttpOnly Secure Cookie 설정

#### 로그인 API 응답 예시 (Node.js/Express)
```javascript
// 로그인 성공 시
app.post('/api/user/login', async (req, res) => {
  try {
    // 사용자 인증 로직...
    const user = await authenticateUser(req.body.email, req.body.password);
    
    // JWT 토큰 생성
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // Access Token: 15분
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id, tokenVersion: user.tokenVersion },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' } // Refresh Token: 7일
    );
    
    // HttpOnly Secure Cookie 설정
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,           // XSS 공격 방지
      secure: true,             // HTTPS에서만 전송
      sameSite: 'strict',       // CSRF 공격 방지
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      path: '/api/auth/refresh' // 특정 경로에서만 접근 가능
    });
    
    // 응답 본문에는 Access Token만 포함
    res.json({
      accessToken,
      userName: user.userName,
      email: user.email
    });
    
  } catch (error) {
    res.status(401).json({ message: '로그인 실패' });
  }
});
```

#### 토큰 갱신 API
```javascript
app.post('/api/auth/refresh', async (req, res) => {
  try {
    // HttpOnly Cookie에서 Refresh Token 추출
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh Token이 없습니다' });
    }
    
    // Refresh Token 검증
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // 사용자 정보 조회
    const user = await User.findById(decoded.userId);
    
    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      // 토큰이 무효화된 경우 (재발급 시 기존 토큰 폐기)
      res.clearCookie('refreshToken');
      return res.status(401).json({ message: '유효하지 않은 토큰입니다' });
    }
    
    // 새로운 토큰 생성
    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    const newRefreshToken = jwt.sign(
      { userId: user.id, tokenVersion: user.tokenVersion },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
    
    // 기존 Refresh Token 폐기 (보안 강화)
    user.tokenVersion += 1;
    await user.save();
    
    // 새로운 HttpOnly Cookie 설정
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh'
    });
    
    res.json({
      accessToken: newAccessToken,
      userName: user.userName,
      email: user.email
    });
    
  } catch (error) {
    res.clearCookie('refreshToken');
    res.status(401).json({ message: '토큰 갱신 실패' });
  }
});
```

#### 로그아웃 API
```javascript
app.post('/api/auth/logout', async (req, res) => {
  try {
    // HttpOnly Cookie 제거
    res.clearCookie('refreshToken', {
      path: '/api/auth/refresh'
    });
    
    res.json({ message: '로그아웃 성공' });
  } catch (error) {
    res.status(500).json({ message: '로그아웃 실패' });
  }
});
```

### 2. CORS 설정

#### Express.js CORS 설정
```javascript
const cors = require('cors');

// CORS 미들웨어 설정
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // 프론트엔드 URL
  credentials: true, // HttpOnly Cookie 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));

// 또는 더 세밀한 제어
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

#### Spring Boot CORS 설정 (Java)
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173") // 프론트엔드 URL
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("Content-Type", "Authorization")
            .allowCredentials(true) // HttpOnly Cookie 허용
            .maxAge(3600);
    }
}
```

### 3. 환경 변수 설정

#### .env 파일 예시
```env
# JWT 설정
JWT_SECRET=your-super-secret-jwt-key-here
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-here

# 프론트엔드 URL
FRONTEND_URL=http://localhost:5173

# HTTPS 설정 (프로덕션)
NODE_ENV=production
HTTPS_ENABLED=true
```

### 4. 보안 체크리스트

- [ ] HttpOnly Cookie 사용
- [ ] Secure 플래그 설정 (HTTPS 환경)
- [ ] SameSite 설정 (CSRF 방지)
- [ ] CORS credentials: true 설정
- [ ] Access Token 짧은 만료시간 (15분)
- [ ] Refresh Token 긴 만료시간 (7일)
- [ ] 토큰 재발급 시 기존 토큰 폐기
- [ ] 환경 변수로 민감한 정보 관리
- [ ] HTTPS 사용 (프로덕션)

### 5. 추가 보안 고려사항

#### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5회 시도
  message: '너무 많은 로그인 시도가 있었습니다. 15분 후 다시 시도해주세요.'
});

app.use('/api/user/login', loginLimiter);
```

#### Helmet.js (보안 헤더)
```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 6. 테스트 방법

#### 브라우저 개발자 도구에서 확인
1. Network 탭에서 요청/응답 확인
2. Application 탭에서 HttpOnly Cookie 확인
3. Console에서 JavaScript로 Cookie 접근 불가 확인

```javascript
// 브라우저 콘솔에서 테스트
console.log(document.cookie); // HttpOnly Cookie는 보이지 않음
```

이 설정으로 XSS, CSRF, 토큰 탈취 등의 보안 위협을 크게 줄일 수 있습니다. 