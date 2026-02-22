import React, { useState, useEffect } from "react";
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
  Popconfirm,
  Spin,
} from "antd";
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
  CloseCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { booksAPI, usersAPI, loansAPI, penaltiesAPI } from "../services/api";

const { Content } = Layout;
const { TabPane } = Tabs;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalBooks: 0,
    borrowedBooks: 0,
    totalUsers: 0,
    totalPenalties: 0,
    overdueLoans: 0,
  });

  // Book Management State
  const [books, setBooks] = useState([]);
  const [isBookModalVisible, setIsBookModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookForm] = Form.useForm();

  // User Management State
  const [users, setUsers] = useState([]);

  // Loans Management State
  const [loans, setLoans] = useState([]);

  // Admin auth check + load data
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/Auth");
      return;
    }
    const userData = JSON.parse(user);
    if (userData.role !== "ADMIN") {
      message.error("Access denied. Admin only.");
      navigate("/");
      return;
    }
    loadAllData();
  }, [navigate]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadBooks(), loadUsers(), loadLoans()]);
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async () => {
    try {
      const res = await booksAPI.getAll(0, 200);
      const bookList = res.data.content || res.data;
      setBooks(bookList.map((b) => ({ ...b, key: b.id })));

      // Calculate book stats
      const totalCopies = bookList.reduce(
        (sum, b) => sum + (b.totalCopies || 0),
        0,
      );
      const availCopies = bookList.reduce(
        (sum, b) => sum + (b.availableCopies || 0),
        0,
      );
      setStats((prev) => ({
        ...prev,
        totalBooks: totalCopies,
        borrowedBooks: totalCopies - availCopies,
      }));
    } catch (e) {
      message.error("Failed to load books");
    }
  };

  const loadUsers = async () => {
    try {
      const res = await usersAPI.getAll();
      const userList = res.data;
      setUsers(userList.map((u) => ({ ...u, key: u.id })));
      setStats((prev) => ({ ...prev, totalUsers: userList.length }));
    } catch (e) {
      message.error("Failed to load users");
    }
  };

  const loadLoans = async () => {
    try {
      const [loansRes, overdueRes, penaltiesRes] = await Promise.all([
        loansAPI.getAll(),
        loansAPI.getOverdue(),
        penaltiesAPI.getAll(),
      ]);
      setLoans((loansRes.data || []).map((l) => ({ ...l, key: l.id })));

      // Calculate penalty total
      const totalPenalties = (penaltiesRes.data || [])
        .filter((p) => p.status === "UNPAID")
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      setStats((prev) => ({
        ...prev,
        overdueLoans: (overdueRes.data || []).length,
        totalPenalties,
      }));
    } catch (e) {
      // Loans/penalties not critical for page load
    }
  };

  // ===================
  // BOOK MANAGEMENT
  // ===================

  const bookColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Author",
      dataIndex: "author",
      key: "author",
    },
    {
      title: "Genre",
      dataIndex: "genre",
      key: "genre",
      render: (genre) => <Tag color="blue">{genre}</Tag>,
    },
    {
      title: "ISBN",
      dataIndex: "isbn",
      key: "isbn",
    },
    {
      title: "Year",
      dataIndex: "publishedYear",
      key: "publishedYear",
      width: 80,
    },
    {
      title: "Stock",
      key: "stock",
      width: 100,
      render: (_, record) => (
        <span
          style={{
            color: record.availableCopies === 0 ? "#ff4d4f" : "#52c41a",
          }}
        >
          {record.availableCopies}/{record.totalCopies}
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 110,
      render: (_, record) => (
        <Tag color={record.availableCopies > 0 ? "green" : "red"}>
          {record.availableCopies > 0 ? "Available" : "No Stock"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
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
            description="This action cannot be undone."
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

  const handleDeleteBook = async (bookId) => {
    try {
      await booksAPI.delete(bookId);
      message.success("Book deleted successfully");
      loadBooks();
    } catch (e) {
      message.error(e.response?.data?.message || "Failed to delete book");
    }
  };

  const handleBookFormSubmit = async (values) => {
    setBookLoading(true);
    try {
      // Convert numeric fields
      const bookData = {
        ...values,
        publishedYear: values.publishedYear
          ? parseInt(values.publishedYear)
          : null,
        totalCopies: parseInt(values.totalCopies),
        availableCopies: editingBook
          ? editingBook.availableCopies +
            (parseInt(values.totalCopies) - editingBook.totalCopies)
          : parseInt(values.totalCopies),
      };

      if (editingBook) {
        await booksAPI.update(editingBook.id, bookData);
        message.success("Book updated successfully");
      } else {
        await booksAPI.create(bookData);
        message.success("Book added successfully");
      }
      setIsBookModalVisible(false);
      bookForm.resetFields();
      loadBooks();
    } catch (e) {
      message.error(e.response?.data?.message || "Operation failed");
    } finally {
      setBookLoading(false);
    }
  };

  // ===================
  // USER MANAGEMENT
  // ===================

  const userColumns = [
    {
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "ADMIN" ? "red" : "blue"}>{role}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "ACTIVE" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (date ? date.split("T")[0] : "-"),
    },
    {
      title: "Action",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            type={record.status === "ACTIVE" ? "default" : "primary"}
            icon={
              record.status === "ACTIVE" ? (
                <CloseCircleOutlined />
              ) : (
                <CheckCircleOutlined />
              )
            }
            onClick={() => handleToggleUserStatus(record)}
          >
            {record.status === "ACTIVE" ? "Suspend" : "Activate"}
          </Button>
          <Popconfirm
            title="Delete this user?"
            description="This action cannot be undone."
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
    try {
      if (user.status === "ACTIVE") {
        await usersAPI.suspend(user.id);
        message.success(`${user.fullName} suspended`);
      } else {
        await usersAPI.activate(user.id);
        message.success(`${user.fullName} activated`);
      }
      loadUsers();
    } catch (e) {
      message.error(
        e.response?.data?.message || "Failed to update user status",
      );
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await usersAPI.delete(userId);
      message.success("User deleted successfully");
      loadUsers();
    } catch (e) {
      message.error(e.response?.data?.message || "Failed to delete user");
    }
  };

  // ===================
  // LOANS MANAGEMENT
  // ===================

  const loanColumns = [
    {
      title: "User",
      dataIndex: ["user", "fullName"],
      key: "user",
    },
    {
      title: "Book",
      dataIndex: ["book", "title"],
      key: "book",
    },
    {
      title: "Borrowed Date",
      dataIndex: "borrowedAt",
      key: "borrowedAt",
      render: (date) => (date ? date.split("T")[0] : "-"),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) => (date ? date.split("T")[0] : "-"),
    },
    {
      title: "Return Date",
      dataIndex: "returnedAt",
      key: "returnedAt",
      render: (date) => (date ? date.split("T")[0] : "-"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "BORROWED"
              ? "blue"
              : status === "OVERDUE"
                ? "red"
                : "green"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) =>
        record.status !== "RETURNED" && (
          <Popconfirm
            title="Mark this book as returned?"
            onConfirm={() => handleReturnBook(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" type="primary">
              Return Book
            </Button>
          </Popconfirm>
        ),
    },
  ];

  const handleReturnBook = async (loanId) => {
    try {
      await loansAPI.returnBook(loanId);
      message.success("Book returned successfully");
      loadAllData();
    } catch (e) {
      message.error(e.response?.data?.message || "Failed to return book");
    }
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
        <Content
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <Spin size="large" tip="Loading dashboard..." />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Content
        style={{
          padding: "24px",
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ fontSize: "28px", marginBottom: "4px" }}>
              Admin Dashboard
            </h1>
            <p style={{ color: "#666", fontSize: "16px", margin: 0 }}>
              Manage books, users, and library operations
            </p>
          </div>
          <Button icon={<ReloadOutlined />} onClick={loadAllData}>
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Book Copies"
                value={stats.totalBooks}
                prefix={<BookOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
              <p
                style={{
                  marginTop: "8px",
                  marginBottom: 0,
                  fontSize: "12px",
                  color: "#666",
                }}
              >
                {stats.totalBooks - stats.borrowedBooks} available
              </p>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Books Borrowed"
                value={stats.borrowedBooks}
                prefix={<LineChartOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
              <p
                style={{
                  marginTop: "8px",
                  marginBottom: 0,
                  fontSize: "12px",
                  color: "#666",
                }}
              >
                {stats.overdueLoans} overdue
              </p>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Users"
                value={stats.totalUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Unpaid Penalties"
                value={stats.totalPenalties}
                prefix={<DollarOutlined />}
                precision={2}
                valueStyle={{ color: "#eb2f96" }}
                prefix="RM"
              />
            </Card>
          </Col>
        </Row>

        {/* Tabs */}
        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
            {/* Overview Tab */}
            <TabPane tab="Overview" key="overview">
              <div style={{ padding: "24px 0" }}>
                <h3 style={{ marginBottom: "24px" }}>Quick Actions</h3>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <Card
                      hoverable
                      onClick={() => setActiveTab("books")}
                      style={{ textAlign: "center", cursor: "pointer" }}
                    >
                      <BookOutlined
                        style={{ fontSize: "48px", color: "#1890ff" }}
                      />
                      <h3 style={{ marginTop: "16px" }}>Manage Books</h3>
                      <p style={{ color: "#666" }}>
                        Add, edit, or remove books
                      </p>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card
                      hoverable
                      onClick={() => setActiveTab("users")}
                      style={{ textAlign: "center", cursor: "pointer" }}
                    >
                      <UserOutlined
                        style={{ fontSize: "48px", color: "#52c41a" }}
                      />
                      <h3 style={{ marginTop: "16px" }}>Manage Users</h3>
                      <p style={{ color: "#666" }}>
                        View and manage user accounts
                      </p>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card
                      hoverable
                      onClick={() => setActiveTab("loans")}
                      style={{ textAlign: "center", cursor: "pointer" }}
                    >
                      <LineChartOutlined
                        style={{ fontSize: "48px", color: "#faad14" }}
                      />
                      <h3 style={{ marginTop: "16px" }}>Manage Loans</h3>
                      <p style={{ color: "#666" }}>
                        View loans and process returns
                      </p>
                    </Card>
                  </Col>
                </Row>
              </div>
            </TabPane>

            {/* Manage Books Tab */}
            <TabPane tab="Manage Books" key="books">
              <div
                style={{
                  marginBottom: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Input
                  placeholder="Search by title or author..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: "300px" }}
                  allowClear
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
                dataSource={books.filter(
                  (book) =>
                    book.title
                      ?.toLowerCase()
                      .includes(searchText.toLowerCase()) ||
                    book.author
                      ?.toLowerCase()
                      .includes(searchText.toLowerCase()),
                )}
                pagination={{ pageSize: 10 }}
                scroll={{ x: "max-content" }}
              />
            </TabPane>

            {/* Manage Users Tab */}
            <TabPane tab="Manage Users" key="users">
              <div style={{ marginBottom: "16px" }}>
                <Input
                  placeholder="Search by name or email..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: "300px" }}
                  allowClear
                />
              </div>
              <Table
                columns={userColumns}
                dataSource={users.filter(
                  (user) =>
                    user.fullName
                      ?.toLowerCase()
                      .includes(searchText.toLowerCase()) ||
                    user.email
                      ?.toLowerCase()
                      .includes(searchText.toLowerCase()),
                )}
                pagination={{ pageSize: 10 }}
                scroll={{ x: "max-content" }}
              />
            </TabPane>

            {/* Manage Loans Tab */}
            <TabPane tab="Manage Loans" key="loans">
              <div style={{ marginBottom: "16px" }}>
                <Input
                  placeholder="Search by user or book..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: "300px" }}
                  allowClear
                />
              </div>
              <Table
                columns={loanColumns}
                dataSource={loans.filter(
                  (loan) =>
                    loan.user?.fullName
                      ?.toLowerCase()
                      .includes(searchText.toLowerCase()) ||
                    loan.book?.title
                      ?.toLowerCase()
                      .includes(searchText.toLowerCase()),
                )}
                pagination={{ pageSize: 10 }}
                scroll={{ x: "max-content" }}
              />
            </TabPane>
          </Tabs>
        </Card>

        {/* Add/Edit Book Modal */}
        <Modal
          title={editingBook ? "Edit Book" : "Add New Book"}
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
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input placeholder="Enter book title" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="author"
                  label="Author"
                  rules={[{ required: true, message: "Required" }]}
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
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Select placeholder="Select genre">
                    <Select.Option value="Fiction">Fiction</Select.Option>
                    <Select.Option value="Science Fiction">
                      Science Fiction
                    </Select.Option>
                    <Select.Option value="Fantasy">Fantasy</Select.Option>
                    <Select.Option value="Mystery">Mystery</Select.Option>
                    <Select.Option value="Thriller">Thriller</Select.Option>
                    <Select.Option value="Romance">Romance</Select.Option>
                    <Select.Option value="Non-Fiction">
                      Non-Fiction
                    </Select.Option>
                    <Select.Option value="Biography">Biography</Select.Option>
                    <Select.Option value="Memoir">Memoir</Select.Option>
                    <Select.Option value="Adventure">Adventure</Select.Option>
                    <Select.Option value="History">History</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="isbn" label="ISBN">
                  <Input placeholder="978-0-123-45678-9" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="publishedYear" label="Published Year">
                  <Input type="number" placeholder="2024" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="totalCopies"
                  label="Total Copies"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input type="number" min={1} placeholder="1" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="description" label="Description">
              <Input.TextArea
                rows={3}
                placeholder="Book description (optional — will be fetched from Open Library via ISBN)"
              />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={bookLoading}>
                  {editingBook ? "Update Book" : "Add Book"}
                </Button>
                <Button
                  onClick={() => {
                    setIsBookModalVisible(false);
                    bookForm.resetFields();
                  }}
                >
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
