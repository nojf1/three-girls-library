# 🧪 API Testing Examples

Quick reference for testing the Three Girls Library API endpoints.

## 🔧 Setup

Base URL: `http://localhost:8080/api`

Replace `YOUR_TOKEN_HERE` with the JWT token received from login.

---

## 1️⃣ Authentication

### Register New User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "testpass123",
    "phone": "555-1234"
  }'
```

### Login (Admin)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@library.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBsaWJyYXJ5LmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTcwODU2NzgwMCwiZXhwIjoxNzA4NjU0MjAwfQ...",
  "userId": 1,
  "email": "admin@library.com",
  "fullName": "Admin User",
  "role": "ADMIN"
}
```

### Login (Patron)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }'
```

---

## 2️⃣ Books (Public Endpoints - No Auth)

### Get All Books (Paginated)
```bash
curl "http://localhost:8080/api/books?page=0&size=10&sortBy=title"
```

### Get Book by ID
```bash
curl http://localhost:8080/api/books/1
```

### Search Books
```bash
curl "http://localhost:8080/api/books/search?keyword=harry&page=0&size=10"
```

### Get Available Books
```bash
curl http://localhost:8080/api/books/available
```

### Get All Genres
```bash
curl http://localhost:8080/api/books/genres
```

---

## 3️⃣ Books (Admin Only - Auth Required)

### Create New Book
```bash
curl -X POST http://localhost:8080/api/books \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Hobbit",
    "author": "J.R.R. Tolkien",
    "isbn": "978-0547928227",
    "genre": "Fantasy",
    "description": "A fantasy novel about Bilbo Baggins adventure",
    "publishedYear": 1937,
    "totalCopies": 5,
    "availableCopies": 5
  }'
```

### Update Book
```bash
curl -X PUT http://localhost:8080/api/books/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "To Kill a Mockingbird - Updated",
    "author": "Harper Lee",
    "isbn": "978-0061120084",
    "genre": "Fiction",
    "description": "Updated description",
    "publishedYear": 1960,
    "totalCopies": 10,
    "availableCopies": 8
  }'
```

### Delete Book
```bash
curl -X DELETE http://localhost:8080/api/books/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 4️⃣ Loans (Auth Required)

### Borrow a Book
```bash
curl -X POST http://localhost:8080/api/loans/borrow \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "bookId": 5
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "user": {
    "id": 2,
    "fullName": "Alice Johnson",
    "email": "alice@example.com",
    "role": "PATRON",
    "status": "ACTIVE"
  },
  "book": {
    "id": 5,
    "title": "The Catcher in the Rye",
    "author": "J.D. Salinger",
    "availableCopies": 2
  },
  "borrowedAt": "2026-02-14T10:30:00",
  "dueDate": "2026-02-28T10:30:00",
  "status": "BORROWED"
}
```

### Return a Book
```bash
curl -X POST http://localhost:8080/api/loans/1/return \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get User's Loans
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:8080/api/loans/user/2
```

### Get Overdue Loans (Admin)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:8080/api/loans/overdue
```

---

## 5️⃣ Penalties (Auth Required)

### Get User's Penalties
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:8080/api/penalties/user/2
```

### Waive Penalty (Admin Only)
```bash
curl -X POST http://localhost:8080/api/penalties/1/waive \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🧰 Advanced Examples

### Pagination and Sorting
```bash
# Get books, page 1, 5 per page, sorted by author
curl "http://localhost:8080/api/books?page=1&size=5&sortBy=author"
```

### Complex Search
```bash
# Search for books with keyword in title, author, or description
curl "http://localhost:8080/api/books/search?keyword=tolkien&page=0&size=20"
```

### Filter by Genre
```bash
# Get all fantasy books (if genre filter endpoint exists)
curl "http://localhost:8080/api/books?genre=Fantasy"
```

---

## 🧪 Testing Workflow

### Complete User Journey
```bash
# 1. Register new user
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"testuser@example.com","password":"test123","phone":"555-9999"}' \
  | jq -r '.token')

# 2. View available books
curl http://localhost:8080/api/books/available

# 3. Borrow a book
curl -X POST http://localhost:8080/api/loans/borrow \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":5,"bookId":3}'

# 4. Check my loans
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/loans/user/5
```

### Admin Workflow
```bash
# 1. Login as admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@library.com","password":"password123"}' \
  | jq -r '.token')

# 2. Add new book
curl -X POST http://localhost:8080/api/books \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"New Book",
    "author":"New Author",
    "isbn":"978-1234567890",
    "genre":"Fiction",
    "totalCopies":3,
    "availableCopies":3
  }'

# 3. Check overdue loans
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8080/api/loans/overdue

# 4. Waive a penalty
curl -X POST http://localhost:8080/api/penalties/1/waive \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 🛑 Error Responses

### 401 Unauthorized
```json
{
  "timestamp": "2026-02-14T10:30:00.000+00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Access Denied",
  "path": "/api/books"
}
```

### 403 Forbidden (Wrong Role)
```json
{
  "timestamp": "2026-02-14T10:30:00.000+00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied",
  "path": "/api/books"
}
```

### 404 Not Found
```json
{
  "timestamp": "2026-02-14T10:30:00.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Book not found with id: 999",
  "path": "/api/books/999"
}
```

### 400 Bad Request
```json
{
  "timestamp": "2026-02-14T10:30:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Email already in use",
  "path": "/api/auth/register"
}
```

---

## 📝 Tips

### Save Token to Variable (Bash)
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@library.com","password":"password123"}' \
  | jq -r '.token')

# Use it
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/books
```

### Pretty Print JSON (with jq)
```bash
curl http://localhost:8080/api/books | jq '.'
```

### Save Response to File
```bash
curl http://localhost:8080/api/books > books.json
```

### Silent Mode (Hide Progress)
```bash
curl -s http://localhost:8080/api/books
```

### Include Response Headers
```bash
curl -i http://localhost:8080/api/books
```

### Verbose Mode (Debug)
```bash
curl -v http://localhost:8080/api/books
```

---

## 🔍 Postman Collection

Import these as Postman requests:

1. Create new collection: "Three Girls Library"
2. Add environment variables:
   - `base_url`: `http://localhost:8080/api`
   - `token`: (will be set after login)
3. Add requests from examples above
4. Use `{{base_url}}` and `{{token}}` in requests

---

## ✅ Verification Checklist

After setting up, verify:

- [ ] Can register new user
- [ ] Can login and receive JWT token
- [ ] Can view books without authentication
- [ ] Can search books
- [ ] Can borrow book with authentication
- [ ] Can view user's loans
- [ ] Admin can create/update/delete books
- [ ] Admin can view overdue loans
- [ ] Admin can waive penalties

---

**Happy Testing! 🧪✨**
