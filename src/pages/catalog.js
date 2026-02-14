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
  message,
  Tag,
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import BookCard from '../components/book/bookcard';
import BookDetailModal from '../components/book/bookDetails';
import { searchBooks, getBooksBySubject, getTrendingBooks, getBookWorkDetails } from '../services/openLibrary';
import { reservationsAPI } from '../services/api';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

const Catalog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState(''); 
  const [selectedGenre, setSelectedGenre] = useState('all');
    const [sortBy, setSortBy] = useState('relevance'); 
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
    const trimmedValue = value?.trim() || searchInput.trim();
    
    if (!trimmedValue) {
      message.warning('Please enter a search term');
      return;
    }

    setLoading(true);
    setSearchTerm(trimmedValue);
    setCurrentPage(1);

    try {
      let result;
      
      // Check if it's an ISBN search (numbers only, 10 or 13 digits)
      const isISBN = /^\d{10}(\d{3})?$/.test(trimmedValue.replace(/-/g, ''));
      
      if (isISBN) {
        message.info('Searching by ISBN...');
        result = await searchBooks(`isbn:${trimmedValue}`, 20);
      } else {
        // Normal search
        result = await searchBooks(trimmedValue, 50);
      }
      
      setBooks(result);
      setTotalBooks(result.length);
      
      if (result.length === 0) {
        message.info('No books found. Try a different search term.');
      } else {
        message.success(`Found ${result.length} books!`);
      }
    } catch (error) {
      console.error('Error searching books:', error);
      message.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Quick search suggestions
  const getSearchSuggestion = () => {
    const suggestions = [
      'harry potter',
      'lord of the rings',
      'gatsby',
      'pride and prejudice',
      '1984',
      'to kill a mockingbird',
      'the hobbit',
      'dune',
      'neuromancer',
      'foundation'
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
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

  // NEW: Clear search and filters
  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setSelectedGenre('all');
    setSortBy('relevance');
    setCurrentPage(1);
    loadBooks();
    message.info('Search cleared');
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

// Borrow/Reserve book
const handleBorrow = async (book) => {
  try {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      message.warning('Please login to reserve books');
      navigate('/Auth');
      return;
    }

    setLoading(true);
    
    // Create reservation
    const reservationData = {
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      coverImage: book.coverImage,
    };
    
    await reservationsAPI.create(reservationData);
    
    message.success(`"${book.title}" reserved successfully! Pick it up at the library.`);
    setIsModalVisible(false);
  } catch (error) {
    console.error('Error reserving book:', error);
    
    // Handle specific error messages
    if (error.response?.status === 400) {
      message.error(error.response.data.message || 'You already have a reservation for this book.');
    } else if (error.response?.status === 403) {
      message.error('You have reached the maximum number of reservations.');
    } else {
      message.error('Failed to reserve book. Please try again.');
    }
  } finally {
    setLoading(false);
  }
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
       {/* Search and Filter Section - IMPROVED */}
        <div
          style={{ 
            marginBottom: '24px',
            padding: '24px',
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          {/* Main Search Row */}
          <Flex gap="middle" wrap="wrap" style={{ marginBottom: '16px' }}>
            <Search
              placeholder={`Try searching "${getSearchSuggestion()}"...`}
              allowClear
              enterButton={
                <Button type="primary" icon={<SearchOutlined />}>
                  Search
                </Button>
              }
              size="large"
              onSearch={handleSearch}
              onChange={(e) => setSearchInput(e.target.value)}
              value={searchInput}
              style={{ flex: 1, minWidth: '300px' }}
            />

            <Select
              size="large"
              value={selectedGenre}
              onChange={handleGenreChange}
              options={genres}
              style={{ width: 200 }}
              placeholder="Select Genre"
            />

            <Button 
              size="large" 
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            >
              Reset
            </Button>

            {(searchTerm || selectedGenre !== 'all') && (
              <Button 
                size="large" 
                danger
                onClick={handleClearSearch}
              >
                Clear All
              </Button>
            )}
          </Flex>

          {/* Search Tips */}
          <div style={{ fontSize: '12px', color: '#666' }}>
            <Space split="|">
              <span>💡 <strong>Tip:</strong> Try "author:tolkien" or "subject:fantasy"</span>
              <span>Search by ISBN for exact matches</span>
              <span>Use quotes for exact phrases: "lord of the rings"</span>
            </Space>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedGenre !== 'all') && (
            <div style={{ marginTop: '12px' }}>
              <Text type="secondary" style={{ marginRight: '8px' }}>Active filters:</Text>
              {searchTerm && (
                <Tag 
                  closable 
                  onClose={() => {
                    setSearchTerm('');
                    setSearchInput('');
                    loadBooks();
                  }}
                  color="blue"
                >
                  Search: "{searchTerm}"
                </Tag>
              )}
              {selectedGenre !== 'all' && (
                <Tag 
                  closable 
                  onClose={() => {
                    setSelectedGenre('all');
                    loadBooks();
                  }}
                  color="green"
                >
                  Genre: {selectedGenre}
                </Tag>
              )}
            </div>
          )}
        </div>

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
            <Space>
              <Text type="secondary">
                Showing <strong>{startIndex + 1}-{Math.min(endIndex, totalBooks)}</strong> of{' '}
                <strong>{totalBooks}</strong> books
                {searchTerm && <> for "<strong>{searchTerm}</strong>"</>}
                {selectedGenre !== 'all' && <> in <strong>{selectedGenre}</strong></>}
              </Text>
            </Space>
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