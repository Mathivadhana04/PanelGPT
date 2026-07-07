import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';

export const RegisterPage = () => {
  return (
    <div className="hero-bg flex items-center justify-center min-h-[calc(100vh-73px)] px-4 py-12 relative overflow-hidden">
      {/* Floating particles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[20%] w-16 h-16 rounded-full bg-accent/5 animate-particle-float" />
        <div className="absolute bottom-[30%] left-[20%] w-24 h-24 rounded-full bg-purple-500/5 animate-particle-float [animation-delay:3s]" />
      </div>

      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
