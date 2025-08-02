import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PlanPage from './pages/PlanPage';
import TaskPage from './pages/TaskPage';
import styles from './App.module.css';

type AuthPage = 'login' | 'signup';
type MainPage = 'plan' | 'task';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentAuthPage, setCurrentAuthPage] = useState<AuthPage>('login');
  const [currentMainPage, setCurrentMainPage] = useState<MainPage>('plan');
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);

  const handleLogin = async (email: string, password: string) => {
    // 실제 로그인 로직은 여기에 구현
    // 예시로 간단한 검증만 수행
    if (email && password) {
      setUser({ email });
      setIsLoggedIn(true);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    // 실제 회원가입 로직은 여기에 구현
    // 예시로 간단한 검증만 수행
    if (email && password && name) {
      setUser({ email, name });
      setIsLoggedIn(true);
    } else {
      throw new Error('Invalid signup data');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setCurrentAuthPage('login');
    setCurrentMainPage('plan');
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