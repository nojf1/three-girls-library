package nojf.threegirlslibrary.service;

import nojf.threegirlslibrary.dto.BookRequest;
import nojf.threegirlslibrary.entity.Book;
import nojf.threegirlslibrary.exception.BadRequestException;
import nojf.threegirlslibrary.exception.ResourceNotFoundException;
import nojf.threegirlslibrary.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {
    
    private final BookRepository bookRepository;
    
    @Transactional(readOnly = true)
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Page<Book> getAllBooks(Pageable pageable) {
        return bookRepository.findAll(pageable);
    }
    
    @Transactional(readOnly = true)
    public Book getBookById(Long id) {
        return bookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));
    }
    
    @Transactional(readOnly = true)
    public Page<Book> searchBooks(String keyword, Pageable pageable) {
        return bookRepository.searchBooks(keyword, pageable);
    }
    
    @Transactional(readOnly = true)
    public List<Book> getAvailableBooks() {
        return bookRepository.findByAvailableCopiesGreaterThan(0);
    }
    
    @Transactional(readOnly = true)
    public List<String> getAllGenres() {
        return bookRepository.findAllGenres();
    }
    
    @Transactional
    public Book createBook(BookRequest request) {
        // Check if ISBN already exists
        if (request.getIsbn() != null && bookRepository.existsByIsbn(request.getIsbn())) {
            throw new BadRequestException("Book with ISBN " + request.getIsbn() + " already exists");
        }
        
        Book book = new Book();
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setIsbn(request.getIsbn());
        book.setGenre(request.getGenre());
        book.setDescription(request.getDescription());
        book.setCoverImageUrl(request.getCoverImageUrl());
        book.setPublishedYear(request.getPublishedYear());
        book.setTotalCopies(request.getTotalCopies());
        book.setAvailableCopies(request.getTotalCopies());
        
        return bookRepository.save(book);
    }
    
    @Transactional
    public Book updateBook(Long id, BookRequest request) {
        Book book = getBookById(id);
        
        // Check ISBN uniqueness if changed
        if (request.getIsbn() != null && 
            !request.getIsbn().equals(book.getIsbn()) && 
            bookRepository.existsByIsbn(request.getIsbn())) {
            throw new BadRequestException("Book with ISBN " + request.getIsbn() + " already exists");
        }
        
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setIsbn(request.getIsbn());
        book.setGenre(request.getGenre());
        book.setDescription(request.getDescription());
        book.setCoverImageUrl(request.getCoverImageUrl());
        book.setPublishedYear(request.getPublishedYear());
        
        // Update total copies and adjust available copies
        int difference = request.getTotalCopies() - book.getTotalCopies();
        book.setTotalCopies(request.getTotalCopies());
        book.setAvailableCopies(book.getAvailableCopies() + difference);
        
        return bookRepository.save(book);
    }
    
    @Transactional
    public void deleteBook(Long id) {
        Book book = getBookById(id);
        
        // Check if book has active loans
        if (book.getAvailableCopies() < book.getTotalCopies()) {
            throw new BadRequestException("Cannot delete book with active loans");
        }
        
        bookRepository.delete(book);
    }
}