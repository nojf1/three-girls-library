# 📚 Three Girls Library Management System

A comprehensive library management system built with Spring Boot, MySQL, and RESTful APIs.

## 🚀 Quick Start for New Users

### 1. **Setup Database** (5 minutes)
```bash
# Run the SQL script to create database and tables
mysql -u root -p < database-setup.sql
```
📖 **See detailed instructions**: [DATABASE-SETUP-GUIDE.md](DATABASE-SETUP-GUIDE.md)

### 2. **Configure Application** (2 minutes)
Edit `src/main/resources/application.yaml`:
```yaml
spring:
  datasource:
    username: root  # Your MySQL username
    password: your_password  # Your MySQL password
```

### 3. **Run Application** (1 minute)
```bash
# Using Gradle
./gradlew bootRun

# OR using Maven
./mvnw spring-boot:run
```

### 4. **Test It Works** ✅
```bash
# Login as admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@library.com","password":"password123"}'

# Get all books
curl http://localhost:8080/api/books
```

🎉 **You're ready to go!**

---

## 📁 Project Structure

```
threegirlslibrary/
├── database-setup.sql          ← Run this first! Creates entire database
├── DATABASE-SETUP-GUIDE.md     ← Detailed setup instructions
├── README.md                   ← You are here
├── src/
│   ├── main/
│   │   ├── java/nojf/threegirlslibrary/
│   │   │   ├── config/         ← Security & app configuration
│   │   │   ├── controller/     ← REST API endpoints
│   │   │   ├── dto/            ← Data transfer objects
│   │   │   ├── entity/         ← Database entities (User, Book, Loan, Penalty)
│   │   │   ├── exception/      ← Error handling
│   │   │   ├── repository/     ← Database repositories
│   │   │   ├── security/       ← JWT authentication & filters
│   │   │   ├── service/        ← Business logic
│   │   │   └── util/           ← Utility classes (PasswordHashGenerator)
│   │   └── resources/
│   │       └── application.yaml ← Database & app configuration
│   └── test/
└── build.gradle                ← Project dependencies
```

---

## 🔐 Default Credentials

**Admin Account:**
- Email: `admin@library.com`
- Password: `password123`

**Test Patron Accounts:**
- `alice@example.com` / password123
- `bob@example.com` / password123
- `carol@example.com` / password123

⚠️ **IMPORTANT:** Change these passwords in production!

---

## 🌐 API Endpoints

Base URL: `http://localhost:8080/api`

### Authentication (No token required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get JWT token |

### Books (No token required for GET)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/books` | Get all books (paginated) | No |
| GET | `/books/{id}` | Get book by ID | No |
| GET | `/books/search?keyword=` | Search books | No |
| GET | `/books/available` | Get available books | No |
| GET | `/books/genres` | List all genres | No |
| POST | `/books` | Create new book | Yes (ADMIN) |
| PUT | `/books/{id}` | Update book | Yes (ADMIN) |
| DELETE | `/books/{id}` | Delete book | Yes (ADMIN) |

### Loans (Token required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/loans/borrow` | Borrow a book |
| POST | `/loans/{id}/return` | Return a book |
| GET | `/loans/user/{userId}` | Get user's loans |
| GET | `/loans/overdue` | Get overdue loans |

### Penalties (Token required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/penalties/user/{userId}` | Get user's penalties |
| POST | `/penalties/{id}/waive` | Waive penalty (ADMIN) |

---

## 🔑 Using JWT Authentication

1. **Login to get token:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@library.com","password":"password123"}'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "userId": 1,
  "email": "admin@library.com",
  "fullName": "Admin User",
  "role": "ADMIN"
}
```

2. **Use token in subsequent requests:**
```bash
curl -X POST http://localhost:8080/api/books \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..." \
  -H "Content-Type: application/json" \
  -d '{"title":"New Book","author":"Author Name",...}'
```

---

## 🛠️ Development Tools

### Generate Password Hashes
```bash
# Run the utility class
./gradlew run --args="PasswordHashGenerator YourPassword123"

# Or compile and run
cd src/main/java
javac nojf/threegirlslibrary/util/PasswordHashGenerator.java
java nojf.threegirlslibrary.util.PasswordHashGenerator password123
```

### Running Tests
```bash
./gradlew test
```

### Build JAR
```bash
./gradlew build
java -jar build/libs/threegirlslibrary-0.0.1-SNAPSHOT.jar
```

---

## 📊 Database Schema

### Users Table
- Stores user accounts (patrons and administrators)
- Fields: id, full_name, email, phone, password_hash, role, status, timestamps

### Books Table  
- Library book catalog
- Fields: id, title, author, isbn, genre, description, cover_image_url, published_year, total_copies, available_copies, timestamps

### Loans Table
- Tracks book borrowing transactions
- Fields: id, user_id, book_id, borrowed_at, due_date, returned_at, status, timestamps

### Penalties Table
- Tracks late return fines
- Fields: id, user_id, loan_id, amount, days_late, status, timestamps

---

## 🧪 Sample API Calls

### Register New User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "securepass123",
    "phone": "555-9999"
  }'
```

### Search Books
```bash
curl "http://localhost:8080/api/books/search?keyword=harry&page=0&size=10"
```

### Borrow a Book (requires token)
```bash
curl -X POST http://localhost:8080/api/loans/borrow \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "bookId": 5
  }'
```

### Get User's Loans (requires token)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:8080/api/loans/user/1
```

---

## ❓ Troubleshooting

### Can't connect to database
- ✅ Check MySQL is running: `systemctl status mysql`
- ✅ Verify credentials in `application.yaml`
- ✅ Ensure database exists: `SHOW DATABASES;`

### Authentication fails
- ✅ Check password is correct
- ✅ Verify BCrypt hash in database
- ✅ Check JWT secret in `application.yaml`
- ✅ Look for JWT filter logs at INFO level

### Application won't start
- ✅ Check port 8080 is available
- ✅ Verify Java 17+ is installed: `java -version`
- ✅ Review application logs for errors
- ✅ Run `./gradlew clean build` to rebuild

### JSON serialization errors
- ✅ Ensure `@JsonIgnore` annotations are in place on entity relationships
- ✅ Check entity classes have proper imports

---

## 📚 Documentation Files

1. **[database-setup.sql](database-setup.sql)** - Complete SQL schema with sample data
2. **[DATABASE-SETUP-GUIDE.md](DATABASE-SETUP-GUIDE.md)** - Detailed setup instructions
3. **[PasswordHashGenerator.java](src/main/java/nojf/threegirlslibrary/util/PasswordHashGenerator.java)** - Utility to generate BCrypt hashes

---

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ BCrypt password hashing
- ✅ Role-based access control (ADMIN/PATRON)
- ✅ Stateless session management
- ✅ Protected API endpoints
- ✅ CORS configuration

---

## 🧑‍💻 Tech Stack

- **Backend:** Spring Boot 4.0.2
- **Database:** MySQL 8.0+
- **Security:** Spring Security + JWT
- **ORM:** Hibernate/JPA
- **Build Tool:** Gradle
- **Java Version:** 17

---

## 📝 License

This project is created for educational purposes.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## 📧 Support

For issues or questions:
1. Check logs in the terminal
2. Review [DATABASE-SETUP-GUIDE.md](DATABASE-SETUP-GUIDE.md)
3. Verify database connection
4. Check Spring Boot documentation

---

**Made with ❤️ by the Three Girls Library Team**

*Happy Coding! 📚✨*
