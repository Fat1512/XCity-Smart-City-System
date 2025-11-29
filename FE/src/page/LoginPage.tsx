import React from 'react';
import AuthLayout from '../ui/AuthLayout';
import LoginForm from '../feature/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <AuthLayout 
      title="Đăng nhập" 
      subtitle="Chào mừng bạn quay trở lại hệ thống quản lý thông minh"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
