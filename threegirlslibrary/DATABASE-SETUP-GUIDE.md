# Three Girls Library - Database Setup Guide

## Prerequisites
- MySQL Server 8.0 or higher installed
- MySQL Workbench (optional but recommended)
- Java 17 or higher
- Maven or Gradle

## Quick Setup Steps

### 1. Install MySQL
If you haven't already, install MySQL Server from [mysql.com](https://dev.mysql.com/downloads/mysql/)

### 2. Run the Database Setup Script

**Option A: Using MySQL Command Line**
```bash
# Login to MySQL
mysql -u root -p

# Run the script
source /path/to/database-setup.sql

# Or in one command
mysql -u root -p < database-setup.sql
```

**Option B: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Go to File → Open SQL Script
4. Select `database-setup.sql`
5. Click the Execute button (⚡)

### 3. Generate Real Password Hashes

The SQL script contains placeholder password hashes. You need to generate real BCrypt hashes.

**Option A: Use the Application API** (Recommended)
1. Start the Spring Boot application
2. Register a new admin user via API:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Admin User",
    "email": "admin@library.com",
    "password": "YourSecurePassword123!",
    "phone": "555-0001"
  }'
```
3. Then manually update the role to ADMIN in the database:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@library.com';
```

**Option B: Generate BCrypt Hash Online**
1. Visit https://bcrypt-generator.com/
2. Enter your password (e.g., "password123")
3. Set rounds to 10
4. Copy the generated hash
5. Update the database:
```sql
UPDATE users 
SET password_hash = '$2a$10$YOUR_GENERATED_HASH_HERE' 
WHERE email = 'admin@library.com';
```

**Option C: Use Java Code**
Run this Java code snippet:
```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "password123";
        String hash = encoder.encode(password);
        System.out.println("BCrypt hash: " + hash);
    }
}
```

### 4. Update Application Configuration

Make sure your `src/main/resources/application.yaml` has the correct database credentials:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/three_girls_library?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: root  # Change to your MySQL username
    password: your_mysql_password  # Change to your MySQL password
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### 5. Start the Application

**Using Gradle:**
```bash
./gradlew bootRun
```

**Using Maven:**
```bash
./mvnw spring-boot:run
```

**Using IDE:**
- Run the `ThreegirlslibraryApplication` main class

### 6. Verify Setup

Test the API endpoints:

**Register a new user:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "555-1234"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@library.com",
    "password": "password123"
  }'
```

**Get all books:**
```bash
curl http://localhost:8080/api/books
```

## Database Schema Overview

### Tables Created:
1. **users** - User accounts (patrons and admins)
2. **books** - Library book catalog
3. **loans** - Book borrowing transactions
4. **penalties** - Late return fines

### Sample Data Included:
- 1 Admin user
- 3 Patron users
- 18 Sample books across various genres

## Default Credentials (After Setting Up Properly)

**Admin Account:**
- Email: `admin@library.com`
- Password: `password123` (CHANGE THIS IMMEDIATELY!)

**Test Patron Accounts:**
- alice@example.com / password123
- bob@example.com / password123
- carol@example.com / password123

⚠️ **SECURITY WARNING:** Change all default passwords in production!

## Troubleshooting

### Issue: "Access denied for user"
- Check MySQL username and password in application.yaml
- Ensure MySQL service is running
- Verify user has permissions: `GRANT ALL PRIVILEGES ON three_girls_library.* TO 'root'@'localhost';`

### Issue: "Unknown database"
- Run the database-setup.sql script first
- Verify database was created: `SHOW DATABASES;`

### Issue: "Public Key Retrieval is not allowed"
- Add `allowPublicKeyRetrieval=true` to the JDBC URL (already included in the script)

### Issue: "Table doesn't exist"
- Ensure all tables were created: `SHOW TABLES;`
- Re-run the database-setup.sql script

### Issue: "Cannot connect to MySQL Server"
- Check if MySQL is running: `systemctl status mysql` (Linux) or check Services (Windows)
- Verify port 3306 is not blocked by firewall
- Try connecting with: `mysql -u root -p`

## API Endpoint Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Books (Public - GET only)
- `GET /api/books` - Get all books (paginated)
- `GET /api/books/{id}` - Get book by ID
- `GET /api/books/search?keyword=` - Search books
- `GET /api/books/available` - Get available books
- `GET /api/books/genres` - Get all genres

### Books (Admin only)
- `POST /api/books` - Create new book
- `PUT /api/books/{id}` - Update book
- `DELETE /api/books/{id}` - Delete book

### Loans (Authenticated users)
- `POST /api/loans/borrow` - Borrow a book
- `POST /api/loans/{id}/return` - Return a book
- `GET /api/loans/user/{userId}` - Get user's loans
- `GET /api/loans/overdue` - Get overdue loans

### Penalties (Authenticated users)
- `GET /api/penalties/user/{userId}` - Get user's penalties
- `POST /api/penalties/{id}/waive` - Waive penalty (Admin only)

## Next Steps

1. ✅ Database setup complete
2. ✅ Application running
3. 🔒 Change default passwords
4. 📚 Start adding more books
5. 👥 Create user accounts
6. 🔍 Test all API endpoints
7. 🚀 Deploy to production (optional)

## Support

For issues or questions:
1. Check the application logs
2. Verify database connection
3. Review this setup guide
4. Check Spring Boot documentation

---

**Happy Coding! 📚✨**
