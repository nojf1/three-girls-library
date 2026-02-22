import React, { useState, useEffect } from "react";
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
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import BookCard from "../components/book/bookcard";
import BookDetailModal from "../components/book/bookDetails";
import { useNavigate } from "react-router-dom";
import { booksAPI, loansAPI } from "../services/api";
import {
  enrichBooksWithCovers,
  getDescriptionByISBN,
} from "../services/openLibrary";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

const Catalog = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [books, setBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]); // full list for client-side filter
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [genres, setGenres] = useState([]);

  const pageSize = 12;

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const response = await booksAPI.getAll(0, 100);
      const rawBooks = response.data.content || response.data;

      console.log("rawBooks[0]:", rawBooks[0]); // DEBUG
      const enriched = enrichBooksWithCovers(rawBooks);
      console.log("enriched[0]:", enriched[0]);

      setAllBooks(enriched);
      setBooks(enriched);

      // Build genre list from actual DB data
      const genreList = [
        "all",
        ...new Set(enriched.map((b) => b.genre).filter(Boolean)),
      ];
      setGenres(
        genreList.map((g) => ({
          value: g,
          label: g === "all" ? "All Genres" : g,
        })),
      );
    } catch (error) {
      console.error("Error loading books:", error);
      message.error("Failed to load books. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value) => {
    const keyword = value?.trim() || searchInput.trim();
    if (!keyword) {
      setBooks(allBooks);
      return;
    }
    setLoading(true);
    setCurrentPage(1);
    try {
      const response = await booksAPI.search(keyword, 0, 100);
      const rawBooks = response.data.content || response.data;
      const enriched = enrichBooksWithCovers(rawBooks);
      setBooks(enriched);
      if (enriched.length === 0) message.info("No books found.");
      else message.success(`Found ${enriched.length} books!`);
    } catch (error) {
      message.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenreChange = (value) => {
    setSelectedGenre(value);
    setCurrentPage(1);
    if (value === "all") {
      setBooks(allBooks);
    } else {
      setBooks(allBooks.filter((b) => b.genre === value));
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSelectedGenre("all");
    setCurrentPage(1);
    setBooks(allBooks);
  };

  // View book details — fetch description from Open Library by ISBN
  const handleBookClick = async (book) => {
    setSelectedBook(book);
    setIsModalVisible(true);

    if (book.isbn && !book.description) {
      setLoadingDetails(true);
      try {
        const { getDescriptionByISBN } =
          await import("../services/openLibrary");
        const desc = await getDescriptionByISBN(book.isbn);
        setSelectedBook((prev) => ({
          ...prev,
          description: desc || book.description || "No description available.",
        }));
      } catch (e) {
        // description not critical
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  // Borrow book — use DB book ID (Long)
  const handleBorrow = async (book) => {
    const user = localStorage.getItem("user");
    if (!user) {
      message.warning("Please login to borrow books");
      navigate("/Auth");
      return;
    }
    try {
      await loansAPI.borrow({ bookId: book.id });
      message.success(`"${book.title}" borrowed successfully! Due in 14 days.`);
      setIsModalVisible(false);
      // Refresh books to update availableCopies
      loadBooks();
    } catch (error) {
      if (error.response?.status === 400) {
        message.error(
          error.response.data.message || "Unable to borrow this book.",
        );
      } else {
        message.error("Failed to borrow book. Please try again.");
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startIndex = (currentPage - 1) * pageSize;
  const currentBooks = books.slice(startIndex, startIndex + pageSize);

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
        <div style={{ marginBottom: "32px" }}>
          <Title level={2} style={{ marginBottom: "8px" }}>
            📚 Browse Books
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Showing all books available in Three Girls Library
          </Text>
        </div>

        {/* Search and Filter */}
        <div
          style={{
            marginBottom: "24px",
            padding: "24px",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <Flex gap="middle" wrap="wrap">
            <Search
              placeholder="Search by title, author, genre or ISBN..."
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
              style={{ flex: 1, minWidth: "300px" }}
            />
            <Select
              size="large"
              value={selectedGenre}
              onChange={handleGenreChange}
              options={genres}
              style={{ width: 200 }}
              placeholder="All Genres"
            />
            <Button
              size="large"
              icon={<ReloadOutlined />}
              onClick={handleClearSearch}
            >
              Reset
            </Button>
          </Flex>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spin size="large" tip="Loading books..." />
          </div>
        )}

        {!loading && currentBooks.length === 0 && (
          <Empty description="No books found" style={{ padding: "60px 0" }} />
        )}

        {!loading && currentBooks.length > 0 && (
          <>
            <Flex
              justify="space-between"
              align="center"
              style={{ marginBottom: "16px" }}
            >
              <Text type="secondary">
                Showing{" "}
                <strong>
                  {startIndex + 1}–
                  {Math.min(startIndex + pageSize, books.length)}
                </strong>{" "}
                of <strong>{books.length}</strong> books
              </Text>
              <Text type="secondary">
                Page {currentPage} of {Math.ceil(books.length / pageSize)}
              </Text>
            </Flex>

            <Row gutter={[16, 16]} style={{ marginBottom: "32px" }}>
              {currentBooks.map((book) => (
                <Col key={book.id} xs={24} sm={12} md={8} lg={6}>
                  <BookCard
                    book={book}
                    onViewDetails={handleBookClick}
                    onBorrow={handleBorrow}
                  />
                </Col>
              ))}
            </Row>

            <Flex justify="center" style={{ marginTop: "32px" }}>
              <Pagination
                current={currentPage}
                total={books.length}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} books`
                }
              />
            </Flex>
          </>
        )}

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
