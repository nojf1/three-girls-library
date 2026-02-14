import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Statistic, 
  Row, 
  Col, 
  Tabs,
  Table,
  Button,
  Input,
  Modal,
  Form,
  Select,
  Tag,
  Space,
  message,
  Popconfirm
} from 'antd';
import {
  BookOutlined,
  UserOutlined,
  LineChartOutlined,
  DollarOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usersAPI, loansAPI, reservationsAPI } from '../services/api';

const { Content } = Layout;
const { TabPane } = Tabs;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false); 
  
  // Book Management State
  const [books, setBooks] = useState([]);
  const [isBookModalVisible, setIsBookModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookForm] = Form.useForm();
  
  // User Management State
  const [users, setUsers] = useState([]);

  // Check if user is admin
useEffect(() => {
  const user = localStorage.getItem('user');
  if (!user) {
    navigate('/Auth');
    return;
  }
  const userData = JSON.parse(user);
  if (userData.role !== 'ADMIN') {
    message.error('Access denied. Admin only.');
    navigate('/');
    return;
  }
  
  // Load admin data
  loadAdminData();
}, [navigate]);
const loadAdminData = async () => {
  setLoading(true);
  try {
    // Fetch all data in parallel
    const [usersResponse, loansResponse, reservationsResponse] = await Promise.all([
      usersAPI.getAll(),
      loansAPI.getAll(),
      reservationsAPI.getAll(),
    ]);

    // Process users
    const usersData = usersResponse.data.map(user => ({
      key: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || 'ACTIVE',
      booksCount: user.activeLoanCount || 0,
      lateFees: user.totalPenalties || 0,
      joinDate: user.createdAt,
    }));
    setUsers(usersData);

    // Process loans (as books in admin view)
    const loansData = loansResponse.data.map(loan => ({
      key: loan.id,
      id: loan.id,
      title: loan.bookTitle,
      author: loan.author,
      genre: loan.genre || 'General',
      isbn: loan.isbn,
      totalCopies: 1, // You might track this differently
      availableCopies: loan.returnDate ? 1 : 0,
      status: loan.returnDate ? 'available' : 'borrowed',
      borrowedBy: loan.userName,
      dueDate: loan.dueDate,
    }));
    setBooks(loansData);

    message.success('Admin data loaded successfully');
  } catch (error) {
    console.error('Error loading admin data:', error);
    message.error(error.response?.data?.message || 'Failed to load admin data');
  } finally {
    setLoading(false);
  }
};

  // Statistics data
  const stats = {
    totalBooks: 156,
    borrowedBooks: 58,
    totalUsers: 234,
    revenue: 145.50,
  };

  const bookColumns = [
    {
      title: 'Book Title',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'Published',
      dataIndex: 'publishedYear',
      key: 'publishedYear',
      width: 100,
    },
    {
      title: 'Genre',
      dataIndex: 'genre',
      key: 'genre',
      render: (genre) => <Tag color="blue">{genre}</Tag>,
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
    },
    {
      title: 'Inventory',
      dataIndex: 'totalCopies',
      key: 'totalCopies',
      width: 100,
      render: (total, record) => `${record.availableCopies}/${total}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'available' ? 'green' : 'red'}>
          {status === 'available' ? 'Available' : 'No Stock'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEditBook(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this book?"
            onConfirm={() => handleDeleteBook(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAddBook = () => {
    setEditingBook(null);
    bookForm.resetFields();
    setIsBookModalVisible(true);
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    bookForm.setFieldsValue(book);
    setIsBookModalVisible(true);
  };

  const handleDeleteBook = (bookId) => {
    // TODO: API call to delete book
    message.success('Book deleted successfully');
    setBooks(books.filter(b => b.id !== bookId));
  };

const handleBookFormSubmit = async (values) => {
  try {
    if (editingBook) {
      // For now, books are managed through loans
      // You might want to add a separate books management endpoint
      message.info('Book editing is managed through loan system');
    } else {
      message.info('Books are added when users make reservations');
    }
    setIsBookModalVisible(false);
    bookForm.resetFields();
  } catch (error) {
    message.error('Operation failed');
  }
};

  // ===================
  // USER MANAGEMENT
  // ===================

  const userColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>{role}</Tag>
      ),
    },
    {
      title: 'U.Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'orange'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Books borrowed',
      dataIndex: 'booksCount',
      key: 'booksCount',
      width: 130,
    },
    {
      title: 'Penalty',
      dataIndex: 'lateFees',
      key: 'lateFees',
      render: (fees) => (
        <span style={{ color: fees > 0 ? '#ff4d4f' : '#52c41a' }}>
          RM {fees.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />}>
            Edit
          </Button>
          <Button
            size="small"
            type={record.status === 'ACTIVE' ? 'default' : 'primary'}
            icon={record.status === 'ACTIVE' ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
            onClick={() => handleToggleUserStatus(record)}
          >
            {record.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
          </Button>
          <Popconfirm
            title="Delete this user?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

 const handleToggleUserStatus = async (user) => {
  const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
  
  try {
    await usersAPI.update(user.id, { status: newStatus });
    message.success(`User ${newStatus === 'ACTIVE' ? 'activated' : 'suspended'}`);
    loadAdminData(); // Reload data
  } catch (error) {
    console.error('Error updating user status:', error);
    message.error(error.response?.data?.message || 'Failed to update user status');
  }
};

const handleDeleteUser = async (userId) => {
  try {
    await usersAPI.delete(userId);
    message.success('User deleted successfully');
    loadAdminData(); // Reload data
  } catch (error) {
    console.error('Error deleting user:', error);
    message.error(error.response?.data?.message || 'Failed to delete user');
  }
};

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Admin Dashboard</h1>
          <p style={{ color: '#666', fontSize: '16px' }}>Manage books, users, and library operations</p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Books"
                value={stats.totalBooks}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <p style={{ marginTop: '8px', marginBottom: 0, fontSize: '12px', color: '#666' }}>
                +{stats.totalBooks - stats.borrowedBooks} available
              </p>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Books Borrowed"
                value={stats.borrowedBooks}
                prefix={<LineChartOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
              <p style={{ marginTop: '8px', marginBottom: 0, fontSize: '12px', color: '#666' }}>
                12 overdue
              </p>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Users"
                value={stats.totalUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <p style={{ marginTop: '8px', marginBottom: 0, fontSize: '12px', color: '#666' }}>
                +23 this month
              </p>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Late Fees"
                value={stats.revenue}
                prefix={<DollarOutlined />}
                precision={2}
                valueStyle={{ color: '#eb2f96' }}
              />
              <p style={{ marginTop: '8px', marginBottom: 0, fontSize: '12px', color: '#666' }}>
                This month
              </p>
            </Card>
          </Col>
        </Row>

        {/* Tabs for Management */}
        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
            {/* Overview Tab */}
            <TabPane tab="Overview" key="overview">
              <div style={{ padding: '24px 0' }}>
                <h3 style={{ marginBottom: '24px' }}>Quick Actions</h3>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card 
                      hoverable
                      onClick={() => setActiveTab('books')}
                      style={{ textAlign: 'center', cursor: 'pointer' }}
                    >
                      <BookOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                      <h3 style={{ marginTop: '16px' }}>Manage Books</h3>
                      <p style={{ color: '#666' }}>Add, edit, or remove books from inventory</p>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card 
                      hoverable
                      onClick={() => setActiveTab('users')}
                      style={{ textAlign: 'center', cursor: 'pointer' }}
                    >
                      <UserOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                      <h3 style={{ marginTop: '16px' }}>Manage Users</h3>
                      <p style={{ color: '#666' }}>View and manage user accounts</p>
                    </Card>
                  </Col>
                </Row>
              </div>
            </TabPane>

            {/* Manage Books Tab */}
            <TabPane tab="Manage Books" key="books">
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <Input
                  placeholder="Search books or user"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: '300px' }}
                />
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAddBook}
                >
                  Add New Book
                </Button>
              </div>
              <Table
                columns={bookColumns}
                dataSource={books.filter(book => 
                  book.title.toLowerCase().includes(searchText.toLowerCase()) ||
                  book.author.toLowerCase().includes(searchText.toLowerCase())
                )}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 'max-content' }}
              />
            </TabPane>

            {/* Manage Users Tab */}
            <TabPane tab="Manage User" key="users">
              <div style={{ marginBottom: '16px' }}>
                <Input
                  placeholder="Search users..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: '300px' }}
                />
              </div>
              <Table
                columns={userColumns}
                dataSource={users.filter(user => 
                  user.name.toLowerCase().includes(searchText.toLowerCase()) ||
                  user.email.toLowerCase().includes(searchText.toLowerCase())
                )}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 'max-content' }}
              />
            </TabPane>
          </Tabs>
        </Card>

        {/* Add/Edit Book Modal */}
        <Modal
          title={editingBook ? 'Edit Book' : 'Add New Book'}
          open={isBookModalVisible}
          onCancel={() => {
            setIsBookModalVisible(false);
            bookForm.resetFields();
          }}
          footer={null}
          width={700}
        >
          <Form
            form={bookForm}
            layout="vertical"
            onFinish={handleBookFormSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="title"
                  label="Book Title"
                  rules={[{ required: true, message: 'Please enter book title' }]}
                >
                  <Input placeholder="Enter book title" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="author"
                  label="Author"
                  rules={[{ required: true, message: 'Please enter author name' }]}
                >
                  <Input placeholder="Enter author name" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="genre"
                  label="Genre"
                  rules={[{ required: true, message: 'Please select genre' }]}
                >
                  <Select placeholder="Select genre">
                    <Select.Option value="Fiction">Fiction</Select.Option>
                    <Select.Option value="Science">Science</Select.Option>
                    <Select.Option value="History">History</Select.Option>
                    <Select.Option value="Fantasy">Fantasy</Select.Option>
                    <Select.Option value="Mystery">Mystery</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="isbn"
                  label="ISBN"
                  rules={[{ required: true, message: 'Please enter ISBN' }]}
                >
                  <Input placeholder="978-0-123-45678-9" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="publishedYear"
                  label="Published Year"
                >
                  <Input type="number" placeholder="2024" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="totalCopies"
                  label="Total Copies"
                  rules={[{ required: true, message: 'Please enter number of copies' }]}
                >
                  <Input type="number" min={1} placeholder="1" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingBook ? 'Update Book' : 'Add Book'}
                </Button>
                <Button onClick={() => {
                  setIsBookModalVisible(false);
                  bookForm.resetFields();
                }}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default AdminDashboard;