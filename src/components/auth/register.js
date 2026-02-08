import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newUser = {
        id: Date.now(),
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: 'USER',
      };
      const mockToken = 'mock-jwt-token-' + Date.now();

      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('token', mockToken);

      message.success('Registration successful!');
      form.resetFields();
      navigate('/userDashboard');
      window.location.reload();
    } catch (error) {
      message.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <Form
        form={form}
        name="register"
        onFinish={handleRegister}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="Full Name"
          rules={[
            { required: true, message: 'Please enter your name' },
            { min: 3, message: 'Name must be at least 3 characters' },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Full Name"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Email"
          />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone"
          rules={[
            { required: true, message: 'Please enter your phone number' },
          ]}
        >
          <Input
            prefix={<PhoneOutlined />}
            placeholder="Phone Number"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Please create a password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm Password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
          >
            Register
          </Button>
        </Form.Item>
      </Form>

      <p style={{ textAlign: 'center' }}>
        Already have an account?{' '}
        <Button type="link" onClick={onSwitchToLogin} style={{ padding: 0 }}>
          Login here
        </Button>
      </p>
    </div>
  );
};

export default RegisterForm;