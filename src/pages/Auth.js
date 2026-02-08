import React, { useState } from 'react';
import { Card, Layout } from 'antd';
import LoginForm from '../components/auth/login.js';
import RegisterForm from '../components/auth/register.js';

const { Content } = Layout;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true); // Default is login

  const switchToRegister = () => {
    setIsLogin(false);
  };

  const switchToLogin = () => {
    setIsLogin(true);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '40px 20px'
      }}>
        <Card 
          style={{ 
            width: '100%', 
            maxWidth: '450px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {isLogin ? (
            <LoginForm onSwitchToRegister={switchToRegister} />
          ) : (
            <RegisterForm onSwitchToLogin={switchToLogin} />
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default Auth;