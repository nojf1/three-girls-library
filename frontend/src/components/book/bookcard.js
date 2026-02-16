import React from 'react';
import { Card, Button, Tag, Space, Typography } from 'antd';
import { BookOutlined, EyeOutlined } from '@ant-design/icons';

const { Meta } = Card;
const { Text, Paragraph } = Typography;

const BookCard = ({ book, onViewDetails, onBorrow }) => {
  const isAvailable = book.status === 'available';

  // Handle card click - opens book details
  const handleCardClick = (e) => {
    // Prevent card click when clicking on buttons
    if (e.target.closest('button')) {
      return;
    }
    if (onViewDetails) {
      onViewDetails(book);
    }
  };

  // Handle borrow button click
  const handleBorrowClick = (e) => {
    e.stopPropagation(); // Prevent card click event
    if (onBorrow) {
      onBorrow(book);
    }
  };

  // Handle details button click
  const handleDetailsClick = (e) => {
    e.stopPropagation(); // Prevent card click event
    if (onViewDetails) {
      onViewDetails(book);
    }
  };

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      style={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}
      cover={
        <div
          style={{
            height: '280px',
            background: book.coverImage 
              ? `url(${book.coverImage}) center/cover no-repeat`
              : '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {!book.coverImage && (
            <BookOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />
          )}
          {/* Status Badge */}
          <Tag
            color={isAvailable ? 'green' : 'orange'}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              margin: 0,
            }}
          >
            {isAvailable ? '✓ Available' : '✗ Borrowed'}
          </Tag>
        </div>
      }
      actions={[
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={handleDetailsClick}
        >
          Details
        </Button>,
        <Button
          type={isAvailable ? 'primary' : 'default'}
          disabled={!isAvailable}
          onClick={handleBorrowClick}
          style={{ width: '90%' }}
        >
          {isAvailable ? 'Borrow' : 'Not Available'}
        </Button>,
      ]}
    >
      <Meta
        title={
          <Paragraph
            ellipsis={{ rows: 2, tooltip: book.title }}
            style={{ marginBottom: '8px', fontWeight: 600 }}
          >
            {book.title}
          </Paragraph>
        }
        description={
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text type="secondary" ellipsis>
              by {book.author}
            </Text>
            <Space size="small" wrap>
              <Tag color="blue">{book.genre}</Tag>
              {book.publishedYear && (
                <Tag color="default">{book.publishedYear}</Tag>
              )}
            </Space>
            {book.isbn && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                ISBN: {book.isbn}
              </Text>
            )}
          </Space>
        }
      />
    </Card>
  );
};

export default BookCard;