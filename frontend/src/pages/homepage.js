import React, { useState, useEffect, useRef } from 'react';
import { Layout, Button, Typography, Spin, message } from 'antd';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import BookCardHorizontal from '../components/book/BookCardHorizontal';
import BookDetailModal from '../components/book/bookDetails';
import { getBooksBySubject, getTrendingBooks, getBookWorkDetails } from '../services/openLibrary';
import { loansAPI } from '../services/api';

const { Content } = Layout;
const { Title } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const [bookCategories, setBookCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRefs = useRef({});
  
  // Modal state
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadBooksFromAPI();
  }, []);

  const loadBooksFromAPI = async () => {
    setLoading(true);
    try {
      // Fetch books from Open Library API for 7 categories
      const [
        latestBooks,
        fictionBooks,
        scienceBooks,
        historyBooks,
        fantasyBooks,
        classicBooks,
        romanceBooks,
      ] = await Promise.all([
        getTrendingBooks(10),
        getBooksBySubject('fiction', 10),
        getBooksBySubject('science', 10),
        getBooksBySubject('history', 10),
        getBooksBySubject('fantasy', 10),
        getBooksBySubject('classic', 10),
        getBooksBySubject('romance', 10),
      ]);

      const categories = [
        {
          id: 1,
          title: 'Latest Additions',
          books: latestBooks,
        },
        {
          id: 2,
          title: 'Fiction',
          books: fictionBooks,
        },
        {
          id: 3,
          title: 'Hidden Gems',
          books: classicBooks,
        },
        {
          id: 4,
          title: 'Science & Technology',
          books: scienceBooks,
        },
        {
          id: 5,
          title: 'History',
          books: historyBooks,
        },
        {
          id: 6,
          title: 'Fantasy',
          books: fantasyBooks,
        },
        {
          id: 7,
          title: 'Romance',
          books: romanceBooks,
        },
      ];

      setBookCategories(categories);
    } catch (error) {
      console.error('Error loading books:', error);
      message.error('Failed to load books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = async (book) => {
    console.log('Book clicked:', book);
    
    // Open modal immediately with basic info
    setSelectedBook(book);
    setIsModalVisible(true);
    setLoadingDetails(true);
    
    // Fetch full details (description) in background
    if (book.id) {
      try {
        console.log('Fetching details for:', book.id);
        const details = await getBookWorkDetails(book.id);
        console.log('Got details:', details);
        
        // Update book with full description
        setSelectedBook({
          ...book,
          description: details.description || 'No description available for this book.',
          subjects: details.subjects || book.subjects,
        });
      } catch (error) {
        console.error('Error fetching book details:', error);
        setSelectedBook({
          ...book,
          description: 'Unable to load description at this time.',
        });
      } finally {
        setLoadingDetails(false);
      }
    } else {
      setLoadingDetails(false);
    }
  };

const handleBorrow = async (book) => {
  try {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      message.warning('Please login to borrow books');
      navigate('/Auth');
      return;
    }

    // Borrow book
    const borrowData = {
      bookId: book.key || book.id,
    };
    
    await loansAPI.borrow(borrowData);
    
    message.success(`"${book.title}" borrowed successfully! You have 14 days to return it.`);
    setIsModalVisible(false);
  } catch (error) {
    console.error('Error borrowing book:', error);
    
    if (error.response?.status === 400) {
      message.error(error.response.data.message || 'Unable to borrow this book.');
    } else if (error.response?.status === 403) {
      message.error('You have reached the maximum number of borrowed books.');
    } else {
      message.error('Failed to borrow book. Please try again.');
    }
  }
};

  const handleViewAll = (categoryTitle) => {
    // TODO: Navigate to catalog filtered by category
    console.log('View all:', categoryTitle);
    navigate('/catalog');
  };

  // Scroll left
  const scrollLeft = (categoryId) => {
    const container = scrollRefs.current[categoryId];
    if (container) {
      container.scrollBy({
        left: -600,
        behavior: 'smooth',
      });
    }
  };

  // Scroll right
  const scrollRight = (categoryId) => {
    const container = scrollRefs.current[categoryId];
    if (container) {
      container.scrollBy({
        left: 600,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#fff' }}>
        <Content style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '100vh'
        }}>
          <Spin size="large" tip="Loading books..." />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Content>
        {/* Hero Section */}
        <div
          style={{
            height: '500px',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), #1890ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '40px',
          }}
        >
          <div style={{ textAlign: 'center', padding: '0 20px' }}>
            <h1 style={{ fontSize: '48px', marginBottom: '16px', color: '#fff' }}>
              Welcome to Three Girls Library
            </h1>
            <p style={{ fontSize: '20px', marginBottom: '32px', color: '#fff' }}>
              Discover thousands of books from Open Library
            </p>
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate('/catalog')}
            >
              Browse Catalog
            </Button>
          </div>
        </div>

        {/* Book Categories with Horizontal Scroll */}
        <div style={{ padding: '0 40px 60px' }}>
          {bookCategories.map((category) => (
            <div key={category.id} style={{ marginBottom: '40px' }}>
              {/* Category Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <Title level={3} style={{ margin: 0 }}>
                  {category.title}
                </Title>
                <Button
                  type="link"
                  icon={<RightOutlined />}
                  iconPosition="end"
                  onClick={() => handleViewAll(category.title)}
                >
                  View All
                </Button>
              </div>

              {/* Horizontal Scrollable Book Row with Buttons */}
              <div style={{ position: 'relative' }}>
                {/* Left Scroll Button */}
                <Button
                  icon={<LeftOutlined />}
                  onClick={() => scrollLeft(category.id)}
                  style={{
                    position: 'absolute',
                    left: '-20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                  type="default"
                />

                {/* Book Row */}
                <div
                  ref={(el) => (scrollRefs.current[category.id] = el)}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    paddingBottom: '16px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                  className="book-row"
                >
                  {category.books.map((book) => (
                    <BookCardHorizontal
                      key={book.id}
                      book={book}
                      onClick={handleBookClick}
                    />
                  ))}
                </div>

                {/* Right Scroll Button */}
                <Button
                  icon={<RightOutlined />}
                  onClick={() => scrollRight(category.id)}
                  style={{
                    position: 'absolute',
                    right: '-20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                  type="default"
                />
              </div>
            </div>
          ))}
        </div>
      </Content>

      {/* Book Detail Modal */}
      <BookDetailModal
        visible={isModalVisible}
        book={selectedBook}
        onClose={() => setIsModalVisible(false)}
        onBorrow={handleBorrow}
        loading={loadingDetails}
      />

      {/* Custom scrollbar styles */}
      <style>
        {`
          .book-row::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </Layout>
  );
};

export default HomePage;