import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Table, 
  Button, 
  Tag, 
  Row, 
  Col,
  Statistic,
  Space,
  message,
  Empty,
  Spin
} from 'antd';
import { 
  BookOutlined, 
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, reservationsAPI } from '../services/api';

const { Content } = Layout;

const UserDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState({
    booksBorrowed: 0,
    booksReturned: 0,
    penalty: 0,
    totalBorrows: 0,
  });

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/Auth');
      return;
    }

    // Load dashboard data
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard data from backend
      const response = await dashboardAPI.getMy();
      const data = response.data;
      
      console.log('Dashboard data:', data); // DEBUG
      
      // Set statistics
      setStats({
        booksBorrowed: data.summary?.activeLoanCount || 0,
        booksReturned: data.summary?.totalReturned || 0,
        penalty: data.summary?.totalPenalties || 0,
        totalBorrows: data.summary?.totalLoans || 0,
      });

      // Format active loans
      const formattedLoans = (data.activeLoans || []).map(loan => ({
        key: loan.id,
        id: loan.id,
        bookTitle: loan.bookTitle || loan.title,
        author: loan.author,
        borrowingDate: loan.loanDate,
        dueDate: loan.dueDate,
        returnDate: loan.returnDate,
        status: loan.returnDate ? 'returned' : 'active',
        penalty: loan.penalty || 0,
      }));
      
      setBorrowHistory(formattedLoans);

      // Set reservations
      setReservations(data.activeReservations || []);
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      message.error(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Cancel reservation
  const handleCancelReservation = async (id) => {
    try {
      await reservationsAPI.cancel(id);
      message.success('Reservation cancelled successfully');
      loadDashboardData(); // Reload data
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      message.error(error.response?.data?.message || 'Failed to cancel reservation');
    }
  };

  // Table columns for loans
  const loanColumns = [
    {
      title: 'Books',
      dataIndex: 'bookTitle',
      key: 'bookTitle',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>{record.author}</div>
        </div>
      ),
    },
    {
      title: 'Borrowing date',
      dataIndex: 'borrowingDate',
      key: 'borrowingDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Due date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date, record) => {
        if (!date || record.status === 'returned') return '-';
        
        const dueDate = new Date(date);
        const today = new Date();
        const isOverdue = dueDate < today;
        
        return (
          <span style={{ color: isOverdue ? '#ff4d4f' : 'inherit' }}>
            {dueDate.toLocaleDateString()}
            {isOverdue && <Tag color="red" style={{ marginLeft: 8 }}>OVERDUE</Tag>}
          </span>
        );
      },
    },
    {
      title: 'Return date',
      dataIndex: 'returnDate',
      key: 'returnDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.status === 'active' ? (
            <Tag color="green">Active</Tag>
          ) : (
            <Tag color="default">Returned</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Penalty',
      dataIndex: 'penalty',
      key: 'penalty',
      render: (penalty) => (
        <span style={{ color: penalty > 0 ? '#ff4d4f' : '#52c41a' }}>
          RM {(penalty || 0).toFixed(2)}
        </span>
      ),
    },
  ];

  // Table columns for reservations
  const reservationColumns = [
    {
      title: 'Book Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>{record.author}</div>
        </div>
      ),
    },
    {
      title: 'Reserved On',
      dataIndex: 'reservedAt',
      key: 'reservedAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          PENDING: 'orange',
          READY: 'green',
          EXPIRED: 'red',
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          size="small" 
          danger
          onClick={() => handleCancelReservation(record.id)}
        >
          Cancel
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '100vh'
        }}>
          <Spin size="large" tip="Loading your dashboard..." />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Your library, open 24/7</h1>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Books Borrowed"
                value={stats.booksBorrowed}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Books Returned"
                value={stats.booksReturned}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Penalty"
                value={stats.penalty}
                prefix="RM"
                precision={2}
                valueStyle={{ color: stats.penalty > 0 ? '#faad14' : '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Borrows"
                value={stats.totalBorrows}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Active Reservations */}
        {reservations.length > 0 && (
          <Card 
            title="Active Reservations"
            style={{ marginBottom: '24px' }}
          >
            <Table
              columns={reservationColumns}
              dataSource={reservations}
              pagination={false}
              rowKey="id"
            />
          </Card>
        )}

        {/* Borrowing History Table */}
        <Card 
          title="Borrowing History"
          style={{ marginBottom: '24px' }}
        >
          {borrowHistory.length > 0 ? (
            <Table
              columns={loanColumns}
              dataSource={borrowHistory}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 'max-content' }}
              rowKey="id"
            />
          ) : (
            <Empty description="No borrowing history yet. Start browsing books!" />
          )}
        </Card>

        {/* Browse Books Button */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Button 
            type="primary" 
            size="large"
            icon={<BookOutlined />}
            onClick={() => navigate('/catalog')}
          >
            Browse Books
          </Button>
        </div>
      </Content>
    </Layout>
  );
};

export default UserDashboard;