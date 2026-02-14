import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, message } from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  UserOutlined,
  DashboardOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [current, setCurrent] = useState('home');
  
  // Get user from localStorage (or however you're storing it now)
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location]); // Re-check on location change

  // Update selected menu item based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setCurrent('home');
    else if (path === '/catalog') setCurrent('catalog');
    else if (path === '/Auth') setCurrent('auth');
    else if (path === '/userDashboard') setCurrent('dashboard');
    else if (path === '/adminDashboard') setCurrent('admin');
  }, [location]);

const handleLogout = async () => {
  try {
    // Optional: Call backend logout endpoint
    // await authAPI.logout();
    
    // Clear user data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    
    message.success('Logged out successfully');
    navigate('/');
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear local data even if backend call fails
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  }
};

  // Menu items for guests (not logged in)
  const guestItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/">Home</Link>,
    },
    {
      key: 'catalog',
      icon: <BookOutlined />,
      label: <Link to="/catalog">Browse Books</Link>,
    },
    {
      key: 'auth',
      icon: <UserOutlined />,
      label: <Link to="/Auth">Login/Register</Link>,
      style: { marginLeft: 'auto' },
    },
  ];

  // Menu items for regular users
  const userItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/">Home</Link>,
    },
    {
      key: 'catalog',
      icon: <BookOutlined />,
      label: <Link to="/catalog">Browse Books</Link>,
    },
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/userDashboard">My Library</Link>,
    },
    {
      key: 'user-menu',
      icon: <UserOutlined />,
      label: user?.name || 'User',
      style: { marginLeft: 'auto' },
      children: [
        {
          key: 'profile',
          label: 'Profile',
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Logout',
          onClick: handleLogout,
        },
      ],
    },
  ];

  // Menu items for admin users
  const adminItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/">Home</Link>,
    },
    {
      key: 'catalog',
      icon: <BookOutlined />,
      label: <Link to="/catalog">Browse Books</Link>,
    },
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/userDashboard">My Library</Link>,
    },
    {
      key: 'admin',
      icon: <SettingOutlined />,
      label: <Link to="/adminDashboard">Admin Dashboard</Link>,
    },
    {
      key: 'user-menu',
      icon: <UserOutlined />,
      label: user?.name || 'Admin',
      style: { marginLeft: 'auto' },
      children: [
        {
          key: 'profile',
          label: 'Profile',
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Logout',
          onClick: handleLogout,
        },
      ],
    },
  ];

  // Select menu items based on user role
  const getMenuItems = () => {
    if (!user) return guestItems;
    if (user.role === 'ADMIN') return adminItems;
    return userItems;
  };

  return (
    <div style={{ 
      borderBottom: '1px solid #f0f0f0',
      background: '#fff',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px'
      }}>
        {/* Logo */}
        <Link 
          to="/" 
          style={{ 
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1890ff',
            marginRight: '40px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📚 Three Girls Library
        </Link>

        {/* Menu */}
        <Menu
          mode="horizontal"
          selectedKeys={[current]}
          items={getMenuItems()}
          style={{ 
            flex: 1, 
            border: 'none',
            background: 'transparent'
          }}
        />
      </div>
    </div>
  );
};

export default Navbar;