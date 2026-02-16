package nojf.threegirlslibrary.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LoanRequest {
    @NotNull(message = "Book ID is required")
    private Long bookId;
}