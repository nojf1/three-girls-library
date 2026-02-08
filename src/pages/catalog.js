import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Input, 
  Select, 
  Button, 
  Row, 
  Col, 
  Pagination,
  Space,
  Typography,
  Flex,
  Spin,
  Empty,
  message
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import BookCard from '../components/book/bookcard';
import BookDetailModal from '../components/book/bookDetails';
import { searchBooks, getBooksBySubject, getTrendingBooks, getBookWorkDetails } from '../services/openLibrary';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

const Catalog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalBooks, setTotalBooks] = useState(0);
  
  // ADD THESE MISSING STATE VARIABLES:
  const [selectedBook, setSelectedBook] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const pageSize = 12; // Books per page

  // Genre options
  const genres = [
    { value: 'all', label: 'All Genres' },
    { value: 'fiction', label: 'Fiction' },
    { value: 'science', label: 'Science' },
    { value: 'history', label: 'History' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'mystery', label: 'Mystery' },
    { value: 'romance', label: 'Romance' },
    { value: 'biography', label: 'Biography' },
    { value: 'classic', label: 'Classic' },
  ];

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    try {
      // Load trending books by default
      const result = await getTrendingBooks(50);
      setBooks(result);
      setTotalBooks(result.length);
    } catch (error) {
      console.error('Error loading books:', error);
      message.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  // Search with Open Library API
  const handleSearch = async (value) => {
    if (!value.trim()) {
      loadBooks();
      return;
    }

    setLoading(true);
    setSearchTerm(value);
    setCurrentPage(1);

    try {
      const result = await searchBooks(value, 50);
      setBooks(result);
      setTotalBooks(result.length);
      
      if (result.length === 0) {
        message.info('No books found. Try a different search term.');
      }
    } catch (error) {
      console.error('Error searching books:', error);
      message.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter by genre with Open Library API
  const handleGenreChange = async (value) => {
    setSelectedGenre(value);
    setCurrentPage(1);

    if (value === 'all') {
      loadBooks();
      return;
    }

    setLoading(true);
    try {
      const result = await getBooksBySubject(value, 50);
      setBooks(result);
      setTotalBooks(result.length);
    } catch (error) {
      console.error('Error filtering books:', error);
      message.error('Failed to filter books');
    } finally {
      setLoading(false);
    }
  };

  // Refresh - reload trending books
  const handleRefresh = () => {
    setSearchTerm('');
    setSelectedGenre('all');
    setCurrentPage(1);
    loadBooks();
  };

  // View book details
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

  // Borrow book
  const handleBorrow = (book) => {
    console.log('Borrow book:', book.id);
    // TODO: API call to YOUR backend: borrowBook(book.id)
    message.success(`"${book.title}" borrowed successfully!`);
    setIsModalVisible(false);
  };

  // Pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate displayed books for current page
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentBooks = books.slice(startIndex, endIndex);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '32px' }}>
          <Title level={2} style={{ marginBottom: '8px' }}>
            📚 Browse Books
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Powered by Open Library - Search millions of books
          </Text>
        </div>

        {/* Search and Filter Section */}
        <Flex 
          gap="middle" 
          wrap="wrap" 
          style={{ 
            marginBottom: '24px',
            padding: '20px',
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}
        >
          <Search
            placeholder="Search by title, author, or ISBN..."
            allowClear
            enterButton={
              <Button type="primary" icon={<SearchOutlined />}>
                Search
              </Button>
            }
            size="large"
            onSearch={handleSearch}
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
            style={{ flex: 1, minWidth: '300px' }}
          />

          <Select
            size="large"
            value={selectedGenre}
            onChange={handleGenreChange}
            options={genres}
            style={{ width: 200 }}
          />

          <Button 
            size="large" 
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Flex>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" tip="Loading books from Open Library..." />
          </div>
        )}

        {/* Empty State */}
        {!loading && currentBooks.length === 0 && (
          <Empty
            description="No books found"
            style={{ padding: '60px 0' }}
          />
        )}

        {/* Results Count */}
        {!loading && currentBooks.length > 0 && (
          <Flex justify="space-between" align="center" style={{ marginBottom: '16px' }}>
            <Text type="secondary">
              Showing <strong>{startIndex + 1}-{Math.min(endIndex, totalBooks)}</strong> of{' '}
              <strong>{totalBooks}</strong> books
              {selectedGenre !== 'all' && <> in <strong>{selectedGenre}</strong></>}
            </Text>
            <Text type="secondary">
              Page {currentPage} of {Math.ceil(totalBooks / pageSize)}
            </Text>
          </Flex>
        )}

        {/* Books Grid */}
        {!loading && currentBooks.length > 0 && (
          <>
            <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
              {currentBooks.map((book) => (
                <Col key={book.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                  <BookCard 
                    book={book}
                    onViewDetails={handleBookClick}
                    onBorrow={handleBorrow}
                  />
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            <Flex justify="center" style={{ marginTop: '32px' }}>
              <Pagination
                current={currentPage}
                total={totalBooks}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} books`}
                size="default"
              />
            </Flex>
          </>
        )}

        {/* Book Detail Modal */}
        <BookDetailModal
          visible={isModalVisible}
          book={selectedBook}
          onClose={() => setIsModalVisible(false)}
          onBorrow={handleBorrow}
          loading={loadingDetails}
        />
      </Content>
    </Layout>
  );
};

export default Catalog;