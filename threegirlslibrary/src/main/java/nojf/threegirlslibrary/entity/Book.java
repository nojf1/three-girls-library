package nojf.threegirlslibrary.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "books")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Book {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Title is required")
    @Size(max = 255)
    @Column(nullable = false)
    private String title;
    
    @NotBlank(message = "Author is required")
    @Size(max = 255)
    @Column(nullable = false)
    private String author;
    
    @Size(max = 20)
    @Column(unique = true)
    private String isbn;
    
    @Size(max = 100)
    @Column
    private String genre;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Size(max = 500)
    @Column(name = "cover_image_url")
    private String coverImageUrl;
    
    @Column(name = "published_year")
    private Integer publishedYear;
    
    @Min(value = 0, message = "Total copies must be at least 0")
    @Column(name = "total_copies", nullable = false)
    private Integer totalCopies = 1;
    
    @Min(value = 0, message = "Available copies must be at least 0")
    @Column(name = "available_copies", nullable = false)
    private Integer availableCopies = 1;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @JsonIgnore
    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Loan> loans = new ArrayList<>();
    
    // Helper method to check availability
    public boolean isAvailable() {
        return availableCopies != null && availableCopies > 0;
    }
    
    // Helper method to borrow book
    public void borrowBook() {
        if (availableCopies > 0) {
            availableCopies--;
        } else {
            throw new IllegalStateException("No copies available to borrow");
        }
    }
    
    // Helper method to return book
    public void returnBook() {
        if (availableCopies < totalCopies) {
            availableCopies++;
        } else {
            throw new IllegalStateException("All copies already returned");
        }
    }
}