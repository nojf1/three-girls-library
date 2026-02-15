package nojf.threegirlslibrary.service;

import nojf.threegirlslibrary.dto.LoanRequest;
import nojf.threegirlslibrary.entity.Book;
import nojf.threegirlslibrary.entity.Loan;
import nojf.threegirlslibrary.entity.Penalty;
import nojf.threegirlslibrary.entity.User;
import nojf.threegirlslibrary.exception.BadRequestException;
import nojf.threegirlslibrary.exception.ResourceNotFoundException;
import nojf.threegirlslibrary.repository.LoanRepository;
import nojf.threegirlslibrary.repository.PenaltyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoanService {
    
    private final LoanRepository loanRepository;
    private final PenaltyRepository penaltyRepository;
    private final UserService userService;
    private final BookService bookService;
    
    private static final int LOAN_PERIOD_DAYS = 14;
    private static final BigDecimal LATE_FEE_PER_DAY = new BigDecimal("1.00");
    
    @Transactional(readOnly = true)
    public List<Loan> getAllLoans() {
        return loanRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Loan getLoanById(Long id) {
        return loanRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Loan", "id", id));
    }
    
    @Transactional(readOnly = true)
    public List<Loan> getLoansByUserId(Long userId) {
        return loanRepository.findByUserId(userId);
    }
    
    @Transactional(readOnly = true)
    public List<Loan> getActiveLoansByUserId(Long userId) {
        return loanRepository.findByUserIdAndStatus(userId, Loan.Status.BORROWED);
    }
    
    @Transactional(readOnly = true)
    public List<Loan> getOverdueLoans() {
        return loanRepository.findOverdueLoans(LocalDateTime.now());
    }
    
    @Transactional
    public Loan borrowBook(Long userId, LoanRequest request) {
        User user = userService.getUserById(userId);
        Book book = bookService.getBookById(request.getBookId());
        
        // Check if user is suspended
        if (user.getStatus() == User.Status.SUSPENDED) {
            throw new BadRequestException("User account is suspended");
        }
        
        // Check if book is available
        if (!book.isAvailable()) {
            throw new BadRequestException("Book is not available for borrowing");
        }
        
        // Check if user already has this book borrowed
        if (loanRepository.existsByUserIdAndBookIdAndStatus(userId, book.getId(), Loan.Status.BORROWED)) {
            throw new BadRequestException("You already have this book borrowed");
        }
        
        // Create loan
        Loan loan = new Loan();
        loan.setUser(user);
        loan.setBook(book);
        loan.setBorrowedAt(LocalDateTime.now());
        loan.setDueDate(LocalDateTime.now().plusDays(LOAN_PERIOD_DAYS));
        loan.setStatus(Loan.Status.BORROWED);
        
        // Update book availability
        book.borrowBook();
        
        return loanRepository.save(loan);
    }
    
    @Transactional
    public Loan returnBook(Long loanId) {
        Loan loan = getLoanById(loanId);
        
        // Check if loan is already returned
        if (loan.getStatus() == Loan.Status.RETURNED) {
            throw new BadRequestException("Book is already returned");
        }
        
        // Set return date
        loan.setReturnedAt(LocalDateTime.now());
        loan.setStatus(Loan.Status.RETURNED);
        
        // Update book availability
        Book book = loan.getBook();
        book.returnBook();
        
        // Calculate penalty if overdue
        if (loan.getReturnedAt().isAfter(loan.getDueDate())) {
            createPenalty(loan);
        }
        
        return loanRepository.save(loan);
    }
    
    @Transactional
    protected void createPenalty(Loan loan) {
        long daysLate = ChronoUnit.DAYS.between(loan.getDueDate(), loan.getReturnedAt());
        
        if (daysLate > 0) {
            BigDecimal amount = LATE_FEE_PER_DAY.multiply(BigDecimal.valueOf(daysLate));
            
            Penalty penalty = new Penalty();
            penalty.setUser(loan.getUser());
            penalty.setLoan(loan);
            penalty.setAmount(amount);
            penalty.setDaysLate((int) daysLate);
            penalty.setStatus(Penalty.Status.UNPAID);
            
            penaltyRepository.save(penalty);
        }
    }
    
    @Transactional
    public void updateOverdueLoans() {
        List<Loan> overdueLoans = getOverdueLoans();
        for (Loan loan : overdueLoans) {
            loan.setStatus(Loan.Status.OVERDUE);
            loanRepository.save(loan);
        }
    }
}