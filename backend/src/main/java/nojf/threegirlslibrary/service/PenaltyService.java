package nojf.threegirlslibrary.service;

import nojf.threegirlslibrary.entity.Penalty;
import nojf.threegirlslibrary.exception.ResourceNotFoundException;
import nojf.threegirlslibrary.repository.PenaltyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PenaltyService {
    
    private final PenaltyRepository penaltyRepository;
    
    @Transactional(readOnly = true)
    public List<Penalty> getAllPenalties() {
        return penaltyRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Penalty getPenaltyById(Long id) {
        return penaltyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Penalty", "id", id));
    }
    
    @Transactional(readOnly = true)
    public List<Penalty> getPenaltiesByUserId(Long userId) {
        return penaltyRepository.findByUserId(userId);
    }
    
    @Transactional(readOnly = true)
    public List<Penalty> getUnpaidPenaltiesByUserId(Long userId) {
        return penaltyRepository.findByUserIdAndStatus(userId, Penalty.Status.UNPAID);
    }
    
    @Transactional(readOnly = true)
    public BigDecimal getTotalUnpaidPenalties(Long userId) {
        BigDecimal total = penaltyRepository.getTotalUnpaidPenaltiesByUserId(userId);
        return total != null ? total : BigDecimal.ZERO;
    }
    
    @Transactional
    public Penalty waivePenalty(Long id) {
        Penalty penalty = getPenaltyById(id);
        penalty.setStatus(Penalty.Status.WAIVED);
        return penaltyRepository.save(penalty);
    }
}