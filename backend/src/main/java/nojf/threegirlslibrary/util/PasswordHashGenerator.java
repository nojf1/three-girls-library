package nojf.threegirlslibrary.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility class to generate BCrypt password hashes for database setup.
 * 
 * Usage:
 * 1. Run this class as a Java application
 * 2. Copy the generated hash
 * 3. Update the database with: 
 *    UPDATE users SET password_hash = 'generated_hash' WHERE email = 'user@example.com';
 * 
 * Or use the main method with arguments:
 *    java PasswordHashGenerator password123
 */
public class PasswordHashGenerator {
    
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // If password provided as argument
        if (args.length > 0) {
            String password = args[0];
            String hash = encoder.encode(password);
            System.out.println("\n==============================================");
            System.out.println("Password Hash Generator");
            System.out.println("==============================================");
            System.out.println("Password: " + password);
            System.out.println("BCrypt Hash: " + hash);
            System.out.println("==============================================\n");
            System.out.println("SQL Update Statement:");
            System.out.println("UPDATE users SET password_hash = '" + hash + "' WHERE email = 'your@email.com';");
            System.out.println("\n");
            return;
        }
        
        // Generate hashes for default passwords
        System.out.println("\n==============================================");
        System.out.println("Three Girls Library - Password Hash Generator");
        System.out.println("==============================================\n");
        
        String[] passwords = {
            "password123",
            "admin123",
            "patron123"
        };
        
        System.out.println("Generating BCrypt hashes for common passwords:\n");
        
        for (String password : passwords) {
            String hash = encoder.encode(password);
            System.out.println("Password: " + password);
            System.out.println("Hash:     " + hash);
            System.out.println();
        }
        
        System.out.println("==============================================");
        System.out.println("\nSample SQL Update Statements:");
        System.out.println("==============================================\n");
        
        // Generate fresh hashes for SQL
        System.out.println("-- Update admin user password to 'password123'");
        System.out.println("UPDATE users SET password_hash = '" + 
            encoder.encode("password123") + "' WHERE email = 'admin@library.com';\n");
        
        System.out.println("-- Update patron user password to 'password123'");
        System.out.println("UPDATE users SET password_hash = '" + 
            encoder.encode("password123") + "' WHERE email = 'alice@example.com';\n");
        
        System.out.println("==============================================");
        System.out.println("\nNOTE: Each time you run this, you'll get different");
        System.out.println("hashes due to BCrypt's salt. This is normal and secure!");
        System.out.println("==============================================\n");
        
        // Interactive mode hint
        System.out.println("\nTIP: Run with your password as argument:");
        System.out.println("  java PasswordHashGenerator YourSecurePassword123\n");
    }
}
