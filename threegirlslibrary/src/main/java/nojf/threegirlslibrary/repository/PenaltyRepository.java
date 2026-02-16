package nojf.threegirlslibrary.repository;

import nojf.threegirlslibrary.entity.Penalty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PenaltyRepository extends JpaRepository<Penalty, Long> {
    
    List<Penalty> findByUserId(Long userId);
    
    List<Penalty> findByLoanId(Long loanId);
    
    List<Penalty> findByStatus(Penalty.Status status);
    
    @Query("SELECT p FROM Penalty p WHERE p.user.id = :userId AND p.status = :status")
    List<Penalty> findByUserIdAndStatus(@Param("userId") Long userId, 
                                         @Param("status") Penalty.Status status);
    
    @Query("SELECT SUM(p.amount) FROM Penalty p WHERE p.user.id = :userId AND p.status = 'UNPAID'")
    BigDecimal getTotalUnpaidPenaltiesByUserId(@Param("userId") Long userId);
}