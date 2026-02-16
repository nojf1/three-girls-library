package nojf.threegirlslibrary.repository;

import nojf.threegirlslibrary.entity.Loan;
import nojf.threegirlslibrary.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    
    List<Loan> findByUserId(Long userId);
    
    List<Loan> findByBookId(Long bookId);
    
    List<Loan> findByStatus(Loan.Status status);
    
    List<Loan> findByUserAndStatus(User user, Loan.Status status);
    
    @Query("SELECT l FROM Loan l WHERE l.user.id = :userId AND l.status = :status")
    List<Loan> findByUserIdAndStatus(@Param("userId") Long userId, 
                                      @Param("status") Loan.Status status);
    
    @Query("SELECT l FROM Loan l WHERE l.dueDate < :now AND l.status = 'BORROWED'")
    List<Loan> findOverdueLoans(@Param("now") LocalDateTime now);
    
    @Query("SELECT COUNT(l) FROM Loan l WHERE l.user.id = :userId AND l.status = 'BORROWED'")
    Long countActiveLoansByUserId(@Param("userId") Long userId);
    
    Boolean existsByUserIdAndBookIdAndStatus(Long userId, Long bookId, Loan.Status status);
}