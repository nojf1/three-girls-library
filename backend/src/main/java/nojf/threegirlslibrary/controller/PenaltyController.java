package nojf.threegirlslibrary.controller;

import nojf.threegirlslibrary.dto.MessageResponse;
import nojf.threegirlslibrary.entity.Penalty;
import nojf.threegirlslibrary.service.PenaltyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/penalties")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class PenaltyController {
    
    private final PenaltyService penaltyService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Penalty>> getAllPenalties() {
        List<Penalty> penalties = penaltyService.getAllPenalties();
        return ResponseEntity.ok(penalties);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Penalty> getPenaltyById(@PathVariable Long id) {
        Penalty penalty = penaltyService.getPenaltyById(id);
        return ResponseEntity.ok(penalty);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Penalty>> getPenaltiesByUserId(@PathVariable Long userId) {
        List<Penalty> penalties = penaltyService.getPenaltiesByUserId(userId);
        return ResponseEntity.ok(penalties);
    }
    
    @GetMapping("/user/{userId}/unpaid")
    public ResponseEntity<List<Penalty>> getUnpaidPenaltiesByUserId(@PathVariable Long userId) {
        List<Penalty> penalties = penaltyService.getUnpaidPenaltiesByUserId(userId);
        return ResponseEntity.ok(penalties);
    }
    
    @GetMapping("/user/{userId}/total")
    public ResponseEntity<BigDecimal> getTotalUnpaidPenalties(@PathVariable Long userId) {
        BigDecimal total = penaltyService.getTotalUnpaidPenalties(userId);
        return ResponseEntity.ok(total);
    }
    
    @PutMapping("/{id}/waive")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Penalty> waivePenalty(@PathVariable Long id) {
        Penalty penalty = penaltyService.waivePenalty(id);
        return ResponseEntity.ok(penalty);
    }
}