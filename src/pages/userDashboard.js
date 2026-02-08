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
  Space
} from 'antd';
import { 
  BookOutlined, 
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;

const UserDashboard = () => {
  const navigate = useNavigate();
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [topPicks, setTopPicks] = useState([]);
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

    // Load mock data
    loadMockData();
  }, [navigate]);

  const loadMockData = () => {
    // TODO: Replace with actual API calls

    // Mock statistics
    setStats({
      booksBorrowed: 2,
      booksReturned: 3,
      penalty: 1.50,
      totalBorrows: 5,
    });

    // Mock borrowing history
    const mockHistory = [
      {
        key: 1,
        id: 1,
        bookTitle: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        borrowingDate: '2026-01-15',
        dueDate: '2026-02-15',
        returnDate: null,
        status: 'active',
        penalty: 0,
      },
      {
        key: 2,
        id: 2,
        bookTitle: '1984',
        author: 'George Orwell',
        borrowingDate: '2026-01-20',
        dueDate: '2026-02-20',
        returnDate: null,
        status: 'active',
        penalty: 0,
      },
      {
        key: 3,
        id: 3,
        bookTitle: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        borrowingDate: '2025-12-01',
        dueDate: '2025-12-31',
        returnDate: '2025-12-28',
        status: 'returned',
        penalty: 0,
      },
      {
        key: 4,
        id: 4,
        bookTitle: 'Pride and Prejudice',
        author: 'Jane Austen',
        borrowingDate: '2025-11-15',
        dueDate: '2025-12-15',
        returnDate: '2025-12-18',
        status: 'returned',
        penalty: 1.50,
      },
      {
        key: 5,
        id: 5,
        bookTitle: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        borrowingDate: '2025-10-20',
        dueDate: '2025-11-20',
        returnDate: '2025-11-18',
        status: 'returned',
        penalty: 0,
      },
    ];

    setBorrowHistory(mockHistory);

    // Mock top picks
    const mockTopPicks = [
      { id: 1, title: 'Dune', coverImage: null },
      { id: 2, title: 'Foundation', coverImage: null },
      { id: 3, title: 'Neuromancer', coverImage: null },
      { id: 4, title: 'Snow Crash', coverImage: null },
    ];

    setTopPicks(mockTopPicks);
  };

  // Table columns
  const columns = [
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
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Due date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date, record) => (
        record.status === 'active' ? new Date(date).toLocaleDateString() : '-'
      ),
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
            <>
              <Tag color="green">Ready to receive</Tag>
              <Button 
                size="small" 
                type="primary"
                onClick={() => handleReturn(record.id)}
              >
                Return
              </Button>
            </>
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
          RM {penalty.toFixed(2)}
        </span>
      ),
    },
  ];

  const handleReturn = (bookId) => {
    // TODO: Implement return book functionality
    console.log('Return book:', bookId);
    // API call: returnBook(bookId)
  };

  const handleViewBook = (bookId) => {
    // TODO: Navigate to book details or catalog
    console.log('View book:', bookId);
    // navigate to /catalog or book details
  };

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

        {/* Borrowing History Table */}
        <Card 
          title="Borrowing History"
          style={{ marginBottom: '24px' }}
        >
          <Table
            columns={columns}
            dataSource={borrowHistory}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </Card>

        {/* Today's Top Picks - Bottom Section */}
        <Card title="Today's Top Picks for You">
          <Row gutter={[16, 16]}>
            {topPicks.map((book) => (
              <Col key={book.id} xs={12} sm={8} md={6} lg={4}>
                <Card
                  hoverable
                  cover={
                    <div
                      style={{
                        height: '200px',
                        background: book.coverImage || '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {!book.coverImage && (
                        <BookOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                      )}
                    </div>
                  }
                  onClick={() => handleViewBook(book.id)}
                >
                  <Card.Meta 
                    title={book.title}
                    style={{ textAlign: 'center' }}
                  />
                  <Button 
                    type="primary" 
                    block 
                    style={{ marginTop: '12px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewBook(book.id);
                    }}
                  >
                    Read More
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </Content>
    </Layout>
  );
};

export default UserDashboard;