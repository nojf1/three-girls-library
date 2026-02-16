package nojf.threegirlslibrary.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "loans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Loan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;
    
    @CreationTimestamp
    @Column(name = "borrowed_at", updatable = false)
    private LocalDateTime borrowedAt;
    
    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;
    
    @Column(name = "returned_at")
    private LocalDateTime returnedAt;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.BORROWED;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToOne(mappedBy = "loan", cascade = CascadeType.ALL, orphanRemoval = true)
    private Penalty penalty;
    
    // Enums
    public enum Status {
        BORROWED, RETURNED, OVERDUE
    }
    
    // Helper method to check if loan is overdue
    public boolean isOverdue() {
        return returnedAt == null && LocalDateTime.now().isAfter(dueDate);
    }
    
    // Helper method to calculate days late
    public long getDaysLate() {
        if (returnedAt == null) {
            return 0;
        }
        return java.time.temporal.ChronoUnit.DAYS.between(dueDate, returnedAt);
    }
}