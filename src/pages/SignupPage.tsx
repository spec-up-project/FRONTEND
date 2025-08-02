import React from 'react';
import Signup from '../components/Auth/Signup';

interface SignupPageProps {
  onSignup: (email: string, password: string, name: string) => void;
  onBackToLogin: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignup, onBackToLogin }) => {
  return <Signup onSignup={onSignup} onBackToLogin={onBackToLogin} />;
};

export default SignupPage; 