import React from 'react';
import { Layout, Row, Col, Typography, Space, Divider } from 'antd';
import {
  BookOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  GithubOutlined,
  TwitterOutlined,
  FacebookOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Footer: AntFooter } = Layout;
const { Title, Text, Link: AntLink } = Typography;

const Footer = () => {
  return (
    <AntFooter
      style={{
        background: '#001529',
        color: '#fff',
        marginTop: 'auto',
        padding: '48px 24px 24px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Row gutter={[32, 32]}>
          {/* About Section */}
          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: '#fff', fontSize: '18px' }}>
              <BookOutlined /> Three Girls Library
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
              A community library platform that allows users to browse, borrow and manage books online with ease.
            </Text>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: '#fff', fontSize: '18px' }}>
              Quick Links
            </Title>
            <Space direction="vertical">
              <Link to="/" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                Home
              </Link>
              <Link to="/catalog" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                Browse Books
              </Link>
              <Link to="/Auth" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                Login/Register
              </Link>
              <Link to="/userDashboard" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                My Library
              </Link>
            </Space>
          </Col>

          {/* Support */}
          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: '#fff', fontSize: '18px' }}>
              Support
            </Title>
            <Space direction="vertical">
              <AntLink href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                User Support
              </AntLink>
              <AntLink href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                FAQ
              </AntLink>
              <AntLink href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                Contact Us
              </AntLink>
              <AntLink href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                Report a Problem
              </AntLink>
            </Space>
          </Col>

          {/* Contact */}
          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: '#fff', fontSize: '18px' }}>
              Contact
            </Title>
            <Space direction="vertical">
              <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                <MailOutlined /> info@threegirlslibrary.com
              </Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                <PhoneOutlined /> +60 12-345 6789
              </Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                <EnvironmentOutlined /> Penang, Malaysia
              </Text>
            </Space>
          </Col>
        </Row>

        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.2)', margin: '32px 0 24px' }} />

        {/* Bottom Section */}
        <Row justify="space-between" align="middle">
          <Col xs={24} md={12} style={{ textAlign: 'center', marginBottom: '16px' }}>
            <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
              © {new Date().getFullYear()} Three Girls Library. All rights reserved.
            </Text>
          </Col>
          <Col xs={24} md={12}>
            <Space
              size="large"
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <AntLink href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                Privacy Policy
              </AntLink>
              <AntLink href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                Terms of Service
              </AntLink>
              <Space size="middle">
                <AntLink href="#" style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '18px' }}>
                  <FacebookOutlined />
                </AntLink>
                <AntLink href="#" style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '18px' }}>
                  <TwitterOutlined />
                </AntLink>
                <AntLink href="#" style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '18px' }}>
                  <GithubOutlined />
                </AntLink>
              </Space>
            </Space>
          </Col>
        </Row>
      </div>
    </AntFooter>
  );
};

export default Footer;