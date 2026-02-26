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

// ─── Hero Section Component ────────────────────────────────────────────────
const YOUTUBE_VIDEO_ID = "zXV4UuR-R30";

const HeroSection = ({ navigate }) => {
  const playerRef = React.useRef(null);
  const hasPlayedRef = React.useRef(false); // only auto-play once per mount
  const [playerReady, setPlayerReady] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);

  React.useEffect(() => {
    const init = () => {
      playerRef.current = new window.YT.Player("yt-hero-player", {
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          autoplay: 0,
          controls: 1, // YouTube native controls (volume, fullscreen, etc.)
          rel: 0,
          mute: 1, // must be muted for hover-autoplay (browser policy)
          modestbranding: 1,
          playsinline: 1,
          fs: 1, // allow fullscreen button
        },
        events: {
          onReady: (e) => {
            const iframe = e.target.getIframe();
            iframe.style.cssText =
              "position:absolute;top:0;left:0;width:100%;height:100%;border:0;";
            setPlayerReady(true);
          },
          onStateChange: (e) => {
            // PLAYING=1, BUFFERING=3  →  playing
            // PAUSED=2, ENDED=0, CUED=5  →  not playing
            const playing = e.data === 1 || e.data === 3;
            setIsPlaying(playing);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      init();
    } else if (
      document.querySelector('script[src*="youtube.com/iframe_api"]')
    ) {
      const poll = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(poll);
          init();
        }
      }, 100);
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = init;
    }
  }, []);

  // ── Hover handler — triggers first play on hover ─────────────────────────
  // After the user interacts with the player, YT controls take over completely.
  // We do NOT pause on mouseleave — that would break YT volume/fullscreen controls.
  const handleMouseEnter = () => {
    if (
      !hasPlayedRef.current &&
      playerRef.current &&
      typeof playerRef.current.playVideo === "function"
    ) {
      hasPlayedRef.current = true;
      playerRef.current.playVideo();
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      style={{
        position: "relative",
        width: "100%",
        height: "500px",
        overflow: "hidden",
        marginBottom: "40px",
        background: "#000",
        cursor: "default",
      }}
    >
      {/* ── YouTube iframe placeholder (replaced by YT IFrame API) ── */}
      <div
        id="yt-hero-player"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      />

      {/* ── Welcome overlay — shown when video is NOT playing ──────────────
          When playing: removed from DOM so iframe receives all pointer events
          and all YouTube native controls (volume, seek, fullscreen) work.
          When paused / before first hover: overlay + text shown.            */}
      {!isPlaying && (
        <>
          {/* dark gradient so text is always readable */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.72))",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />

          {/* welcome text + button */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "0 20px",
              zIndex: 3,
              pointerEvents: "none", // container is click-through...
            }}
          >
            <h1
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                color: "#fff",
                textShadow: "0 2px 12px rgba(0,0,0,0.8)",
                fontWeight: 700,
              }}
            >
              Welcome to Three Girls Library
            </h1>
            <p
              style={{
                fontSize: "20px",
                marginBottom: "32px",
                color: "rgba(255,255,255,0.92)",
                textShadow: "0 1px 6px rgba(0,0,0,0.7)",
              }}
            >
              Browse and borrow from our collection
            </p>
            {/* button re-enables pointer events so it is always clickable */}
            <button
              onClick={() => navigate("/catalog")}
              style={{
                pointerEvents: "auto",
                padding: "10px 28px",
                fontSize: "16px",
                fontWeight: 600,
                color: "#fff",
                background: "#1890ff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#096dd9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#1890ff";
              }}
            >
              Browse Catalog
            </button>
          </div>
        </>
      )}
    </div>
  );
};
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
        {/* Hero Section — YouTube Video */}
        <HeroSection navigate={navigate} />

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
