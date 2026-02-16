import React from 'react';
import { Card } from 'antd';
import { BookOutlined } from '@ant-design/icons';

const { Meta } = Card;

const BookCardHorizontal = ({ book, onClick }) => {
  console.log('BookCardHorizontal rendering:', {
    title: book.title,
    coverImage: book.coverImage,
    hasCover: !!book.coverImage
  }); // DEBUG

  return (
    <Card
      hoverable
      style={{ 
        width: '200px',
        flexShrink: 0,
      }}
      cover={
        <div
          style={{
            height: '270px',
            backgroundImage: book.coverImage ? `url(${book.coverImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => onClick && onClick(book)}
        >
          {!book.coverImage && (
            <BookOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />
          )}
        </div>
      }
      onClick={() => onClick && onClick(book)}
    >
      <Meta
        title={
          <div 
            style={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={book.title}
          >
            {book.title}
          </div>
        }
        description={
          <div 
            style={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={book.author}
          >
            {book.author}
          </div>
        }
      />
    </Card>
  );
};

export default BookCardHorizontal;