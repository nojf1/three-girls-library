import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ onSwitchToRegister }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: 1,
        name: 'User',
        email: values.email,
        role: 'USER',
      };
      const mockToken = 'mock-jwt-token-' + Date.now();

      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', mockToken);

      message.success('Login successful!');
      form.resetFields();
      
      if (mockUser.role === 'ADMIN') {
        navigate('/adminDashboard');
      } else {
        navigate('/userDashboard');
      }
      
      window.location.reload();
    } catch (error) {
      message.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <Form
        form={form}
        name="login"
        onFinish={handleLogin}
        layout="vertical"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Please enter your password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
          >
            Login
          </Button>
        </Form.Item>
      </Form>

      <p style={{ textAlign: 'center' }}>
        Don't have an account?{' '}
        <Button type="link" onClick={onSwitchToRegister} style={{ padding: 0 }}>
          Register here
        </Button>
      </p>
    </div>
  );
};

export default LoginForm;