import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PlanPage from './pages/PlanPage';
import TaskPage from './pages/TaskPage';
import { authService } from './services';
import styles from './App.module.css';

type AuthPage = 'login' | 'signup';
type MainPage = 'plan' | 'task';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentAuthPage, setCurrentAuthPage] = useState<AuthPage>('login');
  const [currentMainPage, setCurrentMainPage] = useState<MainPage>('plan');
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 인증 상태 확인
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            setUser({
              email: currentUser.email,
              name: currentUser.userName
            });
            setIsLoggedIn(true);
            console.log('✅ 인증 상태 복원됨:', currentUser);
          }
        } else {
          console.log('❌ 인증되지 않은 상태');
        }
      } catch (error) {
        console.error('❌ 인증 상태 확인 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = async (_email: string, _password: string) => {
    try {
      // authService를 통해 로그인 (토큰은 이미 Login 컴포넌트에서 저장됨)
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser({
          email: currentUser.email,
          name: currentUser.userName
        });
        setIsLoggedIn(true);
        console.log('✅ 로그인 성공:', currentUser);
      } else {
        throw new Error('사용자 정보를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('로그인 처리 실패:', error);
      throw error;
    }
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    // 실제 회원가입 로직은 여기에 구현
    // 예시로 간단한 검증만 수행
    if (email && password && name) {
      // 회원가입 성공 후 로그인 페이지로 이동
      setCurrentAuthPage('login');
    } else {
      throw new Error('Invalid signup data');
    }
  };

  const handleLogout = async () => {
    console.log('🚪 App handleLogout 시작');
    try {
      console.log('🔐 authService.logout() 호출 중...');
      await authService.logout();
      console.log('✅ authService.logout() 완료');
    } catch (error) {
      console.error('❌ 로그아웃 중 오류:', error);
    } finally {
      console.log('🔄 상태 초기화 시작');
      setUser(null);
      setIsLoggedIn(false);
      setCurrentAuthPage('login');
      setCurrentMainPage('plan');
      console.log('✅ 상태 초기화 완료 - 로그인 페이지로 이동');
    }
  };

  const handleSignupClick = () => {
    setCurrentAuthPage('signup');
  };

  const handleBackToLogin = () => {
    setCurrentAuthPage('login');
  };

  const handleTaskClick = () => {
    setCurrentMainPage('task');
  };

  const handleCalendarClick = () => {
    setCurrentMainPage('plan');
  };

  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (currentAuthPage === 'signup') {
      return <SignupPage onSignup={handleSignup} onBackToLogin={handleBackToLogin} />;
    }
    return <LoginPage onLogin={handleLogin} onSignupClick={handleSignupClick} />;
  }

  if (currentMainPage === 'task') {
    return (
      <TaskPage 
        onLogout={handleLogout} 
        user={user} 
        onBackToPlan={handleCalendarClick}
        onCalendarClick={handleCalendarClick}
        currentPage="task"
      />
    );
  }

  return (
    <PlanPage 
      onLogout={handleLogout} 
      user={user} 
      onTaskClick={handleTaskClick}
      onCalendarClick={handleCalendarClick}
      currentPage="calendar"
    />
  );
};

export default App;