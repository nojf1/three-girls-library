package nojf.threegirlslibrary.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BookRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 255)
    private String title;
    
    @NotBlank(message = "Author is required")
    @Size(max = 255)
    private String author;
    
    @Size(max = 20)
    private String isbn;
    
    @Size(max = 100)
    private String genre;
    
    private String description;
    
    @Size(max = 500)
    private String coverImageUrl;
    
    private Integer publishedYear;
    
    @Min(value = 1, message = "Total copies must be at least 1")
    private Integer totalCopies = 1;
}