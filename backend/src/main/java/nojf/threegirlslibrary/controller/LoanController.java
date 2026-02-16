package nojf.threegirlslibrary.controller;

import nojf.threegirlslibrary.dto.LoanRequest;
import nojf.threegirlslibrary.dto.MessageResponse;
import nojf.threegirlslibrary.entity.Loan;
import nojf.threegirlslibrary.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/loans")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class LoanController {
    
    private final LoanService loanService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Loan>> getAllLoans() {
        List<Loan> loans = loanService.getAllLoans();
        return ResponseEntity.ok(loans);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Loan> getLoanById(@PathVariable Long id) {
        Loan loan = loanService.getLoanById(id);
        return ResponseEntity.ok(loan);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Loan>> getLoansByUserId(@PathVariable Long userId) {
        List<Loan> loans = loanService.getLoansByUserId(userId);
        return ResponseEntity.ok(loans);
    }
    
    @GetMapping("/user/{userId}/active")
    public ResponseEntity<List<Loan>> getActiveLoansByUserId(@PathVariable Long userId) {
        List<Loan> loans = loanService.getActiveLoansByUserId(userId);
        return ResponseEntity.ok(loans);
    }
    
    @GetMapping("/overdue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Loan>> getOverdueLoans() {
        List<Loan> loans = loanService.getOverdueLoans();
        return ResponseEntity.ok(loans);
    }
    
    @PostMapping("/borrow")
    public ResponseEntity<Loan> borrowBook(
            @Valid @RequestBody LoanRequest request,
            Authentication authentication) {
        
        Long userId = Long.parseLong(authentication.getName());
        Loan loan = loanService.borrowBook(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(loan);
    }
    
    @PutMapping("/{id}/return")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Loan> returnBook(@PathVariable Long id) {
        Loan loan = loanService.returnBook(id);
        return ResponseEntity.ok(loan);
    }
}