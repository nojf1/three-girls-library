// Open Library API Service - ENHANCED VERSION
// Documentation: https://openlibrary.org/dev/docs/api/books

const OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org';
const OPEN_LIBRARY_COVERS_URL = 'https://covers.openlibrary.org';

/**
 * Search for books by query
 * @param {string} query - Search term (title, author, ISBN, etc.)
 * @param {number} limit - Number of results (default: 10)
 * @returns {Promise<Array>} - Array of books
 */
export const searchBooks = async (query, limit = 10) => {
  try {
    const response = await fetch(
      `${OPEN_LIBRARY_BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    const data = await response.json();
    
    console.log('Search API Response:', data.docs[0]); // DEBUG
    
    // Transform Open Library format to your app format
    return data.docs.map(book => transformBookData(book));
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
};

/**
 * Get books by subject/genre
 * @param {string} subject - Subject/genre (e.g., 'fiction', 'science', 'history')
 * @param {number} limit - Number of results (default: 10)
 * @returns {Promise<Array>} - Array of books
 */
export const getBooksBySubject = async (subject, limit = 10) => {
  try {
    const response = await fetch(
      `${OPEN_LIBRARY_BASE_URL}/subjects/${subject.toLowerCase()}.json?limit=${limit}`
    );
    const data = await response.json();
    
    console.log(`Subject API (${subject}) Response:`, data.works[0]); // DEBUG
    
    // Transform Open Library format to your app format
    const transformedBooks = data.works.map(book => transformSubjectBook(book));
    
    console.log(`Transformed book (${subject}):`, transformedBooks[0]); // DEBUG
    
    return transformedBooks;
  } catch (error) {
    console.error('Error getting books by subject:', error);
    return [];
  }
};

/**
 * Get all available subjects/genres from Open Library
 * @returns {Promise<Array>} - Array of genre names
 */
export const getAvailableGenres = async () => {
  // These are the most popular subjects on Open Library
  // You can expand this list or fetch dynamically
  return [
    'fiction',
    'science',
    'history',
    'fantasy',
    'mystery',
    'romance',
    'biography',
    'classic',
    'science_fiction',
    'horror',
    'thriller',
    'poetry',
    'drama',
    'adventure',
    'philosophy'
  ];
};

/**
 * Get book work details (includes description)
 * @param {string} workKey - Work key (e.g., "/works/OL45804W")
 * @returns {Promise<Object>} - Work details with description
 */
export const getBookWorkDetails = async (workKey) => {
  try {
    // Remove leading slash if present
    const cleanKey = workKey.startsWith('/') ? workKey.substring(1) : workKey;
    
    const response = await fetch(
      `${OPEN_LIBRARY_BASE_URL}/${cleanKey}.json`
    );
    const data = await response.json();
    
    return {
      description: data.description?.value || data.description || null,
      subjects: data.subjects || [],
    };
  } catch (error) {
    console.error('Error getting work details:', error);
    return { description: null, subjects: [] };
  }
};

/**
 * Get trending/popular books
 * @param {number} limit - Number of results (default: 10)
 * @returns {Promise<Array>} - Array of books
 */
export const getTrendingBooks = async (limit = 10) => {
  try {
    const response = await fetch(
      `${OPEN_LIBRARY_BASE_URL}/subjects/bestseller.json?limit=${limit}`
    );
    const data = await response.json();
    
    console.log('Trending API Response:', data.works[0]); // DEBUG
    
    return data.works.map(book => transformSubjectBook(book));
  } catch (error) {
    console.error('Error getting trending books:', error);
    // Fallback to fiction if trending fails
    return getBooksBySubject('fiction', limit);
  }
};

/**
 * Get book cover URL by cover ID
 * @param {string|number} coverId - Cover ID from Open Library
 * @param {string} size - Size: 'S' (small), 'M' (medium), 'L' (large)
 * @returns {string|null} - Cover image URL or null
 */
export const getCoverUrl = (coverId, size = 'M') => {
  if (!coverId) return null;
  const url = `${OPEN_LIBRARY_COVERS_URL}/b/id/${coverId}-${size}.jpg`;
  console.log('Generated cover URL:', url); // DEBUG
  return url;
};

/**
 * Get cover URL by ISBN
 * @param {string} isbn - ISBN number
 * @param {string} size - Size: 'S', 'M', 'L'
 * @returns {string|null} - Cover image URL or null
 */
export const getCoverUrlByISBN = (isbn, size = 'M') => {
  if (!isbn) return null;
  return `${OPEN_LIBRARY_COVERS_URL}/b/isbn/${isbn}-${size}.jpg`;
};

/**
 * Get cover URL by Open Library ID (OLID)
 * @param {string} olid - Open Library ID (e.g., "OL123M")
 * @param {string} size - Size: 'S', 'M', 'L'
 * @returns {string|null} - Cover image URL or null
 */
export const getCoverUrlByOLID = (olid, size = 'M') => {
  if (!olid) return null;
  return `${OPEN_LIBRARY_COVERS_URL}/b/olid/${olid}-${size}.jpg`;
};

/**
 * Transform Open Library search result to app format
 * @param {Object} book - Open Library book object from search
 * @returns {Object} - Transformed book object
 */
const transformBookData = (book) => {
  // Get cover image - search API uses "cover_i"
  let coverImage = null;
  
  if (book.cover_i) {
    coverImage = getCoverUrl(book.cover_i, 'L');
  } else if (book.isbn && book.isbn.length > 0) {
    coverImage = getCoverUrlByISBN(book.isbn[0], 'L');
  }

  console.log('Transform searchBooks - cover_i:', book.cover_i, 'coverImage:', coverImage); // DEBUG

  return {
    id: book.key || book.seed?.[0] || `book-${Date.now()}-${Math.random()}`,
    title: book.title || 'Unknown Title',
    author: book.author_name ? book.author_name[0] : 'Unknown Author',
    authorsList: book.author_name || [],
    coverImage: coverImage,
    coverId: book.cover_i,
    isbn: book.isbn ? book.isbn[0] : null,
    publishedYear: book.first_publish_year,
    publisher: book.publisher ? book.publisher[0] : null,
    genre: book.subject ? book.subject[0] : 'General',
    subjects: book.subject ? book.subject.slice(0, 5) : [],
    pages: book.number_of_pages_median,
    language: book.language ? book.language[0] : 'en',
    description: book.first_sentence ? book.first_sentence[0] : 'No description available.',
    // For your library management
    status: 'available',
    availableCopies: 3,
    totalCopies: 3,
  };
};

/**
 * Transform Open Library subject/works result to app format
 * @param {Object} book - Open Library works object from subjects
 * @returns {Object} - Transformed book object
 */
const transformSubjectBook = (book) => {
  // Get cover image - subjects API uses "cover_id"
  let coverImage = null;
  
  console.log('Raw book data:', {
    title: book.title,
    cover_id: book.cover_id,
    cover_edition_key: book.cover_edition_key,
    description: book.description,
  }); // DEBUG
  
  if (book.cover_id) {
    // Primary method: use cover_id
    coverImage = getCoverUrl(book.cover_id, 'L');
    console.log('Using cover_id:', book.cover_id, '→', coverImage); // DEBUG
  } else if (book.cover_edition_key) {
    // Fallback: use edition key
    coverImage = getCoverUrlByOLID(book.cover_edition_key, 'L');
    console.log('Using cover_edition_key:', book.cover_edition_key, '→', coverImage); // DEBUG
  } else {
    console.warn('No cover found for book:', book.title); // DEBUG
  }

  const transformed = {
    id: book.key || `/works/${book.cover_edition_key}` || `book-${Date.now()}-${Math.random()}`,
    title: book.title || 'Unknown Title',
    author: book.authors && book.authors.length > 0 ? book.authors[0].name : 'Unknown Author',
    authorsList: book.authors ? book.authors.map(a => a.name) : [],
    coverImage: coverImage,
    coverId: book.cover_id,
    publishedYear: book.first_publish_year,
    genre: book.subject ? book.subject[0] : 'General',
    subjects: book.subject || [],
    pages: null,
    language: 'en',
    description: 'Click "Details" to see more information about this book.',
    isbn: null,
    publisher: null,
    // For your library management
    status: 'available',
    availableCopies: 3,
    totalCopies: 3,
  };

  console.log('Transformed book:', {
    title: transformed.title,
    coverImage: transformed.coverImage
  }); // DEBUG

  return transformed;
};

export default {
  searchBooks,
  getBooksBySubject,
  getTrendingBooks,
  getAvailableGenres,
  getBookWorkDetails,
  getCoverUrl,
  getCoverUrlByISBN,
  getCoverUrlByOLID,
};