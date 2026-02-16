-- ============================================================
-- Three Girls Library Management System - Database Setup Script
-- ============================================================
-- This script creates the complete database schema for the
-- Three Girls Library application with all necessary tables,
-- constraints, indexes, and sample data.
--
-- Usage:
--   1. Open MySQL command line or MySQL Workbench
--   2. Run this script: mysql -u root -p < database-setup.sql
--   3. Or copy and paste into MySQL Workbench and execute
-- ============================================================

-- ============================================================
-- 1. DATABASE CREATION
-- ============================================================

-- Drop database if exists (WARNING: This will delete all data!)
DROP DATABASE IF EXISTS three_girls_library;

-- Create database
CREATE DATABASE three_girls_library
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Use the database
USE three_girls_library;

-- ============================================================
-- 2. TABLE CREATION
-- ============================================================

-- ------------------------------------------------------------
-- Table: users
-- Description: Stores user accounts (patrons and administrators)
-- ------------------------------------------------------------
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('PATRON', 'ADMIN') NOT NULL DEFAULT 'PATRON',
    status ENUM('ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: books
-- Description: Stores library book catalog
-- ------------------------------------------------------------
CREATE TABLE books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    genre VARCHAR(100),
    description TEXT,
    cover_image_url VARCHAR(500),
    published_year INT,
    total_copies INT NOT NULL DEFAULT 1,
    available_copies INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_title (title),
    INDEX idx_author (author),
    INDEX idx_isbn (isbn),
    INDEX idx_genre (genre),
    INDEX idx_available (available_copies),
    CONSTRAINT chk_total_copies CHECK (total_copies >= 0),
    CONSTRAINT chk_available_copies CHECK (available_copies >= 0),
    CONSTRAINT chk_copies_logic CHECK (available_copies <= total_copies)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: loans
-- Description: Tracks book borrowing transactions
-- ------------------------------------------------------------
CREATE TABLE loans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    returned_at TIMESTAMP NULL,
    status ENUM('BORROWED', 'RETURNED', 'OVERDUE') NOT NULL DEFAULT 'BORROWED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_book_id (book_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    INDEX idx_borrowed_at (borrowed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: penalties
-- Description: Tracks late return penalties/fines
-- ------------------------------------------------------------
CREATE TABLE penalties (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    loan_id BIGINT NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    days_late INT NOT NULL,
    status ENUM('UNPAID', 'WAIVED') NOT NULL DEFAULT 'UNPAID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_loan_id (loan_id),
    INDEX idx_status (status),
    CONSTRAINT chk_amount CHECK (amount >= 0),
    CONSTRAINT chk_days_late CHECK (days_late >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. SAMPLE DATA INSERTION
-- ============================================================

-- ------------------------------------------------------------
-- Insert Sample Users
-- ------------------------------------------------------------
-- Note: Default password for all users is 'password123'
-- Password hash generated using BCrypt with strength 10
-- You should change these passwords after first login!

INSERT INTO users (full_name, email, phone, password_hash, role, status) VALUES
-- Admin user (email: admin@library.com, password: password123)
('Admin User', 'admin@library.com', '555-0001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 'ACTIVE'),

-- Patron users (all passwords: password123)
('Alice Johnson', 'alice@example.com', '555-0101', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PATRON', 'ACTIVE'),
('Bob Smith', 'bob@example.com', '555-0102', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PATRON', 'ACTIVE'),
('Carol Williams', 'carol@example.com', '555-0103', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PATRON', 'ACTIVE');

-- ------------------------------------------------------------
-- Insert Sample Books
-- ------------------------------------------------------------

INSERT INTO books (title, author, isbn, genre, description, published_year, total_copies, available_copies) VALUES
-- Fiction
('To Kill a Mockingbird', 'Harper Lee', '978-0061120084', 'Fiction', 'A classic novel set in the American South during the 1930s, dealing with racial injustice and childhood innocence.', 1960, 5, 5),
('1984', 'George Orwell', '978-0451524935', 'Science Fiction', 'A dystopian social science fiction novel about totalitarianism and surveillance.', 1949, 4, 4),
('Pride and Prejudice', 'Jane Austen', '978-0141439518', 'Romance', 'A romantic novel of manners set in Georgian England.', 1813, 3, 3),
('The Great Gatsby', 'F. Scott Fitzgerald', '978-0743273565', 'Fiction', 'A novel about the American Dream in the Roaring Twenties.', 1925, 4, 4),
('The Catcher in the Rye', 'J.D. Salinger', '978-0316769174', 'Fiction', 'A story about teenage rebellion and angst.', 1951, 3, 3),

-- Science Fiction & Fantasy
('The Hobbit', 'J.R.R. Tolkien', '978-0547928227', 'Fantasy', 'A fantasy novel about Bilbo Baggins adventure to win a share of treasure guarded by a dragon.', 1937, 5, 5),
('Dune', 'Frank Herbert', '978-0441172719', 'Science Fiction', 'An epic science fiction novel set in a distant future amid a sprawling feudal interstellar society.', 1965, 4, 4),
('Harry Potter and the Sorcerers Stone', 'J.K. Rowling', '978-0439708180', 'Fantasy', 'The first novel in the Harry Potter series about a young wizard.', 1997, 6, 6),

-- Mystery & Thriller
('The Da Vinci Code', 'Dan Brown', '978-0307474278', 'Mystery', 'A mystery thriller novel following symbologist Robert Langdon.', 2003, 4, 4),
('Gone Girl', 'Gillian Flynn', '978-0307588371', 'Thriller', 'A psychological thriller about a marriage gone terribly wrong.', 2012, 3, 3),

-- Non-Fiction
('Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', '978-0062316097', 'Non-Fiction', 'An exploration of human history from the Stone Age to modern times.', 2011, 4, 4),
('Educated', 'Tara Westover', '978-0399590504', 'Memoir', 'A memoir about a woman who grows up in a survivalist family and eventually escapes to learn about the wider world.', 2018, 3, 3),
('Becoming', 'Michelle Obama', '978-1524763138', 'Biography', 'A memoir by former First Lady of the United States Michelle Obama.', 2018, 4, 4),

-- Classic Literature
('Moby-Dick', 'Herman Melville', '978-1503280786', 'Adventure', 'The narrative of Captain Ahab obsessive quest to kill the white whale.', 1851, 2, 2),
('Jane Eyre', 'Charlotte Brontë', '978-0141441146', 'Romance', 'A novel about the experiences of the eponymous heroine.', 1847, 3, 3),

-- Contemporary
('The Midnight Library', 'Matt Haig', '978-0525559474', 'Fiction', 'A novel about all the choices that go into a life well lived.', 2020, 4, 4),
('Where the Crawdads Sing', 'Delia Owens', '978-0735219090', 'Mystery', 'A novel combining mystery and natural observation.', 2018, 5, 5),
('The Silent Patient', 'Alex Michaelides', '978-1250301697', 'Thriller', 'A psychological thriller about a woman who shoots her husband and then never speaks again.', 2019, 3, 3);

-- ============================================================
-- 4. VERIFICATION QUERIES
-- ============================================================

-- Display table counts
SELECT 'Users' AS Table_Name, COUNT(*) AS Record_Count FROM users
UNION ALL
SELECT 'Books', COUNT(*) FROM books
UNION ALL
SELECT 'Loans', COUNT(*) FROM loans
UNION ALL
SELECT 'Penalties', COUNT(*) FROM penalties;

-- Display sample data
SELECT '=== SAMPLE USERS ===' AS Info;
SELECT id, full_name, email, role, status FROM users;

SELECT '=== SAMPLE BOOKS ===' AS Info;
SELECT id, title, author, genre, available_copies, total_copies FROM books LIMIT 10;

-- ============================================================
-- 5. USEFUL QUERIES FOR REFERENCE
-- ============================================================

-- Uncomment these queries to test the database structure:

-- Check available books:
-- SELECT title, author, genre, available_copies 
-- FROM books 
-- WHERE available_copies > 0 
-- ORDER BY title;

-- Check user loans:
-- SELECT u.full_name, b.title, l.borrowed_at, l.due_date, l.status
-- FROM loans l
-- JOIN users u ON l.user_id = u.id
-- JOIN books b ON l.book_id = b.id
-- WHERE l.status = 'BORROWED';

-- Check overdue loans:
-- SELECT u.full_name, b.title, l.borrowed_at, l.due_date, 
--        DATEDIFF(NOW(), l.due_date) AS days_overdue
-- FROM loans l
-- JOIN users u ON l.user_id = u.id
-- JOIN books b ON l.book_id = b.id
-- WHERE l.status IN ('BORROWED', 'OVERDUE') 
-- AND l.due_date < NOW();

-- Check unpaid penalties:
-- SELECT u.full_name, p.amount, p.days_late, p.status
-- FROM penalties p
-- JOIN users u ON p.user_id = u.id
-- WHERE p.status = 'UNPAID';

-- ============================================================
-- DATABASE SETUP COMPLETE!
-- ============================================================

-- IMPORTANT NOTES:
-- 1. Default admin credentials:
--    Email: admin@library.com
--    Password: password123
--    ⚠️ CHANGE THIS IMMEDIATELY IN PRODUCTION!
--
-- 2. Test patron accounts (all use password 'password123'):
--    - alice@example.com
--    - bob@example.com
--    - carol@example.com
--
-- 3. The password hashes are valid BCrypt hashes for 'password123'
--    You can login immediately with these credentials!
--
-- 4. Update the application.yaml with your MySQL credentials:
--    username: root (or your MySQL username)
--    password: your_mysql_password
--    url: jdbc:mysql://localhost:3306/three_girls_library
--
-- 5. To generate new password hashes, use the included utility:
--    Run: src/main/java/nojf/threegirlslibrary/util/PasswordHashGenerator.java
--    Or register new users via: POST /api/auth/register
--
-- 6. After running this script, start your Spring Boot application:
--    ./gradlew bootRun  (or ./mvnw spring-boot:run)
--
-- 7. Test the setup by logging in:
--    POST http://localhost:8080/api/auth/login
--    Body: {"email": "admin@library.com", "password": "password123"}
--
-- 8. You should receive a JWT token in the response!
--    Use this token in the Authorization header for protected endpoints:
--    Authorization: Bearer <your-jwt-token>
