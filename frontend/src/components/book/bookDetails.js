import React from "react";
import {
  Modal,
  Row,
  Col,
  Typography,
  Tag,
  Space,
  Button,
  Divider,
  Descriptions,
  Spin,
} from "antd";
import {
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  NumberOutlined,
  GlobalOutlined,
  TagsOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const BookDetailModal = ({ visible, book, onClose, onBorrow, loading }) => {
  if (!book) return null;

  const isAvailable = book.availableCopies > 0;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        isAvailable && (
          <Button
            key="borrow"
            type="primary"
            onClick={() => {
              onBorrow(book);
              onClose();
            }}
          >
            Borrow This Book
          </Button>
        ),
      ]}
      width={900}
      centered
    >
      <Row gutter={[24, 24]} style={{ marginTop: "20px" }}>
        {/* Book Cover Column */}
        <Col xs={24} md={8}>
          <div
            style={{
              width: "100%",
              height: "400px",
              backgroundImage: book.coverImageUrl
                ? `url(${book.coverImageUrl})`
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {!book.coverImageUrl && (
              <BookOutlined style={{ fontSize: "100px", color: "#d9d9d9" }} />
            )}
          </div>

          {/* Status Badge */}
          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <Tag
              color={isAvailable ? "green" : "orange"}
              style={{ fontSize: "16px", padding: "8px 16px" }}
            >
              {isAvailable
                ? "✓ Available for Borrowing"
                : "✗ Currently Borrowed"}
            </Tag>
          </div>

          {/* Additional Info */}
          {book.availableCopies !== undefined && (
            <div style={{ marginTop: "12px", textAlign: "center" }}>
              <Text type="secondary">
                {book.availableCopies} of {book.totalCopies} copies available
              </Text>
            </div>
          )}
        </Col>

        {/* Book Details Column */}
        <Col xs={24} md={16}>
          {/* Title and Author */}
          <Title level={3} style={{ marginBottom: "8px" }}>
            {book.title}
          </Title>
          <Space style={{ marginBottom: "16px" }}>
            <UserOutlined />
            <Text strong style={{ fontSize: "16px" }}>
              {book.author}
            </Text>
          </Space>

          {/* Tags */}
          <Space size="small" wrap style={{ marginBottom: "16px" }}>
            <Tag color="blue" icon={<TagsOutlined />}>
              {book.genre}
            </Tag>
            {book.publishedYear && (
              <Tag color="default" icon={<CalendarOutlined />}>
                {book.publishedYear}
              </Tag>
            )}
          </Space>

          <Divider />

          {/* Description */}
          <div style={{ marginBottom: "24px" }}>
            <Title level={5}>
              <FileTextOutlined /> Description
            </Title>
            {loading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin tip="Loading description..." />
              </div>
            ) : (
              <Paragraph style={{ color: "#666" }}>
                {book.description || "No description available for this book."}
              </Paragraph>
            )}
          </div>

          {/* Book Details */}
          <Descriptions column={1} bordered size="small">
            {book.isbn && (
              <Descriptions.Item
                label={
                  <>
                    <NumberOutlined /> ISBN
                  </>
                }
              >
                {book.isbn}
              </Descriptions.Item>
            )}
            {book.pages && (
              <Descriptions.Item
                label={
                  <>
                    <FileTextOutlined /> Pages
                  </>
                }
              >
                {book.pages}
              </Descriptions.Item>
            )}
            {book.publisher && (
              <Descriptions.Item label="Publisher">
                {book.publisher}
              </Descriptions.Item>
            )}
            {book.language && (
              <Descriptions.Item
                label={
                  <>
                    <GlobalOutlined /> Language
                  </>
                }
              >
                {book.language}
              </Descriptions.Item>
            )}
          </Descriptions>

          {/* Subjects/Tags */}
          {book.subjects && book.subjects.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <Title level={5}>Subjects</Title>
              <Space size="small" wrap>
                {book.subjects.slice(0, 10).map((subject, index) => (
                  <Tag key={index}>{subject}</Tag>
                ))}
              </Space>
            </div>
          )}
        </Col>
      </Row>
    </Modal>
  );
};

export default BookDetailModal;
