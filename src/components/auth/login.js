import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

const LoginForm = ({ onSwitchToRegister }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleLogin = async (values) => {
  setLoading(true);
  try {
    // Call backend login API
    const response = await authAPI.login({
      email: values.email,
      password: values.password,
    });
    
    const { token, user } = response.data;

    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);

    message.success('Login successful!');
    form.resetFields();
    
    if (user.role === 'ADMIN') {
      navigate('/adminDashboard');
    } else {
      navigate('/userDashboard');
    }
    
    window.location.reload();
  } catch (error) {
    message.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
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