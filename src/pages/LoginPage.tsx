import React from 'react';
import Login from '../components/Auth/Login';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  onSignupClick: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSignupClick }) => {
  return <Login onLogin={onLogin} onSignupClick={onSignupClick} />;
};

export default LoginPage;
