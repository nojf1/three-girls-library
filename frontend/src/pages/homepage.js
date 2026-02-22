import React, { useState, useEffect, useRef } from "react";
import { Layout, Button, Typography, Spin, message } from "antd";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import BookCardHorizontal from "../components/book/BookCardHorizontal";
import BookDetailModal from "../components/book/bookDetails";
import { booksAPI, loansAPI } from "../services/api";
import {
  enrichBooksWithCovers,
  getDescriptionByISBN,
} from "../services/openLibrary";

const { Content } = Layout;
const { Title } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const [bookCategories, setBookCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRefs = useRef({});

  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    try {
      // Fetch all books from our own backend
      const response = await booksAPI.getAll(0, 100);
      const rawBooks = response.data.content || response.data;

      // Enrich with cover images from Open Library using ISBN
      const enriched = enrichBooksWithCovers(rawBooks);

      // Group books by genre for homepage categories
      const grouped = {};
      enriched.forEach((book) => {
        const genre = book.genre || "General";
        if (!grouped[genre]) grouped[genre] = [];
        grouped[genre].push(book);
      });

      // Build category list — show "All Books" first, then by genre
      const categories = [
        { id: "all", title: "All Books", books: enriched },
        ...Object.entries(grouped).map(([genre, books], i) => ({
          id: genre,
          title: genre,
          books,
        })),
      ];

      setBookCategories(categories);
    } catch (error) {
      console.error("Error loading books:", error);
      message.error("Failed to load books. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = async (book) => {
    setSelectedBook(book);
    setIsModalVisible(true);

    // Fetch description from Open Library if not already available
    if (book.isbn && !book.description) {
      setLoadingDetails(true);
      try {
        const desc = await getDescriptionByISBN(book.isbn);
        setSelectedBook((prev) => ({
          ...prev,
          description: desc || "No description available.",
        }));
      } catch (e) {
        // not critical
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
      loadBooks(); // Refresh to update availableCopies
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

  const scrollLeft = (categoryId) => {
    const container = scrollRefs.current[categoryId];
    if (container) container.scrollBy({ left: -600, behavior: "smooth" });
  };

  const scrollRight = (categoryId) => {
    const container = scrollRefs.current[categoryId];
    if (container) container.scrollBy({ left: 600, behavior: "smooth" });
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh", background: "#fff" }}>
        <Content
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <Spin size="large" tip="Loading books..." />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", background: "#fff" }}>
      <Content>
        {/* Hero Section */}
        <div
          style={{
            height: "500px",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), #1890ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            marginBottom: "40px",
          }}
        >
          <div style={{ textAlign: "center", padding: "0 20px" }}>
            <h1
              style={{ fontSize: "48px", marginBottom: "16px", color: "#fff" }}
            >
              Welcome to Three Girls Library
            </h1>
            <p
              style={{ fontSize: "20px", marginBottom: "32px", color: "#fff" }}
            >
              Browse and borrow from our collection
            </p>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/catalog")}
            >
              Browse Catalog
            </Button>
          </div>
        </div>

        {/* Book Categories */}
        <div style={{ padding: "0 40px 60px" }}>
          {bookCategories.map((category) => (
            <div key={category.id} style={{ marginBottom: "40px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <Title level={3} style={{ margin: 0 }}>
                  {category.title}
                </Title>
                <Button
                  type="link"
                  icon={<RightOutlined />}
                  iconPosition="end"
                  onClick={() => navigate("/catalog")}
                >
                  View All
                </Button>
              </div>

              <div style={{ position: "relative" }}>
                <Button
                  icon={<LeftOutlined />}
                  onClick={() => scrollLeft(category.id)}
                  style={{
                    position: "absolute",
                    left: "-20px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 10,
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                />
                <div
                  ref={(el) => (scrollRefs.current[category.id] = el)}
                  style={{
                    display: "flex",
                    gap: "16px",
                    overflowX: "auto",
                    overflowY: "hidden",
                    paddingBottom: "16px",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
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
                <Button
                  icon={<RightOutlined />}
                  onClick={() => scrollRight(category.id)}
                  style={{
                    position: "absolute",
                    right: "-20px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 10,
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Content>

      <BookDetailModal
        visible={isModalVisible}
        book={selectedBook}
        onClose={() => setIsModalVisible(false)}
        onBorrow={handleBorrow}
        loading={loadingDetails}
      />

      <style>{`.book-row::-webkit-scrollbar { display: none; }`}</style>
    </Layout>
  );
};

export default HomePage;
