// Open Library API Service
// Purpose: Enrich our library's book records with cover images and descriptions
// using ISBN as the shared key between our DB and Open Library.
// Our DB manages the real book inventory (total_copies, available_copies).
// Open Library only provides supplementary display info.

const OPEN_LIBRARY_BASE_URL = "https://openlibrary.org";
const OPEN_LIBRARY_COVERS_URL = "https://covers.openlibrary.org";

/**
 * Get cover image URL by ISBN (no API call needed, just a direct URL)
 * @param {string} isbn
 * @param {string} size - 'S', 'M', 'L'
 * @returns {string|null}
 */
export const getCoverUrlByISBN = (isbn, size = "M") => {
  if (!isbn) return null;
  // Open Library requires ISBN without dashes
  const cleanIsbn = isbn.replace(/-/g, "");
  return `${OPEN_LIBRARY_COVERS_URL}/b/isbn/${cleanIsbn}-${size}.jpg`;
};

/**
 * Fetch book description from Open Library by ISBN.
 * @param {string} isbn
 * @returns {Promise<string|null>}
 */
export const getDescriptionByISBN = async (isbn) => {
  if (!isbn) return null;
  try {
    const response = await fetch(
      `${OPEN_LIBRARY_BASE_URL}/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
    );
    const data = await response.json();
    const key = `ISBN:${isbn}`;
    if (!data[key]) return null;

    const book = data[key];
    if (book.excerpts && book.excerpts.length > 0) {
      return book.excerpts[0].text;
    }
    if (book.notes) {
      return typeof book.notes === "string" ? book.notes : book.notes.value;
    }
    return null;
  } catch (error) {
    console.error("Error fetching description from Open Library:", error);
    return null;
  }
};

/**
 * Enrich a book with cover image URL from Open Library using ISBN.
 * Cover image URL is generated instantly (no API call).
 * @param {Object} book - Book object from our backend DB
 * @returns {Object} - Same book with coverImageUrl filled in if missing
 */
export const enrichBookWithOpenLibrary = (book) => {
  const coverImageUrl = book.coverImageUrl || getCoverUrlByISBN(book.isbn, "L");
  return { ...book, coverImageUrl };
};

/**
 * Enrich a list of books with cover images (no API calls needed)
 * @param {Array} books
 * @returns {Array}
 */
export const enrichBooksWithCovers = (books) => {
  return books.map(enrichBookWithOpenLibrary);
};

export default {
  getCoverUrlByISBN,
  getDescriptionByISBN,
  enrichBookWithOpenLibrary,
  enrichBooksWithCovers,
};
