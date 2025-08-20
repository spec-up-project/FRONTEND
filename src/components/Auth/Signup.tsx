import React, { useState } from 'react';
import styles from './Signup.module.css';
import { API_CONFIG, apiRequest } from '../../config/api';

interface SignupProps {
  onSignup: (email: string, password: string, userName: string) => void;
  onBackToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup, onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  // 회원가입 API 호출 함수
  const signupAPI = async (email: string, password: string, userName: string) => {
    console.log('🔍 회원가입 API 호출 시작:', { email, userName, passwordLength: password.length });
    
    // 서버에서 기대하는 형식에 맞게 데이터 구성
    // 서버 오류 메시지에 따르면 "name", "username" 필드는 인식하지 못함
    const requestData = {
      email: email.trim(),
      password: password,
      userName: userName.trim(),
    };
    
    console.log('📤 전송할 데이터:', {
      ...requestData,
      password: '[HIDDEN]' // 보안을 위해 비밀번호는 숨김
    });
    
    try {
      const result = await apiRequest(API_CONFIG.ENDPOINTS.SIGNUP, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      
      console.log('🎉 회원가입 API 성공:', result);
      return result;
    } catch (error: any) {
      console.error('💥 회원가입 API 실패:', error);
      
      // 더 자세한 에러 정보 로깅
      if (error.message) {
        console.error('에러 메시지:', error.message);
      }
      if (error.response) {
        console.error('서버 응답:', error.response);
      }
      
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    console.log('📝 회원가입 폼 제출:', { email, userName, passwordLength: password.length });
    
    // 클라이언트 측 유효성 검사
    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }
    
    if (!userName.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    
    if (password !== confirmPassword) {
      console.log('❌ 비밀번호 불일치');
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      console.log('❌ 비밀번호 길이 부족:', password.length);
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }
    
    // 이름 길이 검증
    if (userName.trim().length < 2) {
      setError('이름은 최소 2자 이상이어야 합니다.');
      return;
    }
    
    setIsLoading(true);
    console.log('⏳ 로딩 상태 시작');
    
    try {
      // API 호출
      await signupAPI(email, password, userName);
      
      console.log('✅ 회원가입 성공');
      
      // 성공 시 부모 컴포넌트의 onSignup 콜백 호출
      await onSignup(email, password, userName);
      
      // 성공 메시지 표시
      alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
      
      // 로그인 페이지로 이동
      onBackToLogin();
      
    } catch (error: any) {
      console.error('💥 회원가입 처리 실패:', error);
      
      // 더 구체적인 에러 메시지 처리
      let errorMessage = '회원가입 중 오류가 발생했습니다.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response && error.response.message) {
        errorMessage = error.response.message;
      } else if (error.status === 400) {
        errorMessage = '입력 정보를 확인해주세요.';
      } else if (error.status === 409) {
        errorMessage = '이미 존재하는 이메일입니다.';
      } else if (error.status === 422) {
        errorMessage = '입력값이 유효하지 않습니다.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      console.log('⏹️ 로딩 상태 종료');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.signupCard}>
        {/* Logo */}
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            Neekly Reports
          </div>
        </div>

        {/* Title */}
        <p className={styles.subtitle}>
          Create your account
        </p>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Full name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
              />
              <button
                type="button"
                className={styles.showPasswordBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.37,7 12,7Z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.passwordContainer}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                required
              />
              <button
                type="button"
                className={styles.showPasswordBtn}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.37,7 12,7Z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}

          <button 
            type="submit" 
            disabled={isLoading}
            className={`${styles.signUpBtn} ${isLoading ? styles.signUpBtnDisabled : ''}`}
          >
            {isLoading ? (
              <div className={styles.spinner}></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Additional Options */}
        <div className={styles.options}>
          <p className={styles.createAccount}>
            Already have an account? <button onClick={onBackToLogin} className={styles.link}>Sign in</button>
          </p>
        </div>

        {/* Privacy Notice */}
        <div className={styles.privacy}>
          <p className={styles.privacyText}>
            By creating an account, you agree to our <a href="#" className={styles.link}>Terms of Service</a> and <a href="#" className={styles.link}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup; 