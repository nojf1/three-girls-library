package nojf.threegirlslibrary.service;

import nojf.threegirlslibrary.dto.LoginRequest;
import nojf.threegirlslibrary.dto.RegisterRequest;
import nojf.threegirlslibrary.dto.AuthResponse;
import nojf.threegirlslibrary.entity.User;
import nojf.threegirlslibrary.exception.BadRequestException;
import nojf.threegirlslibrary.repository.UserRepository;
import nojf.threegirlslibrary.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }
        
        // Create new user
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.PATRON); // Default role
        user.setStatus(User.Status.ACTIVE);
        
        User savedUser = userRepository.save(user);
        
        // Generate JWT token
        String token = tokenProvider.generateToken(savedUser.getId(), 
                                                    savedUser.getEmail(), 
                                                    savedUser.getRole().name());
        
        return new AuthResponse(token, savedUser.getId(), savedUser.getEmail(), 
                                savedUser.getFullName(), savedUser.getRole().name());
    }
    
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
            )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Get user details
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new BadRequestException("User not found"));
        
        // Check if user is suspended
        if (user.getStatus() == User.Status.SUSPENDED) {
            throw new BadRequestException("Account is suspended");
        }
        
        // Generate JWT token
        String token = tokenProvider.generateToken(user.getId(), 
                                                    user.getEmail(), 
                                                    user.getRole().name());
        
        return new AuthResponse(token, user.getId(), user.getEmail(), 
                                user.getFullName(), user.getRole().name());
    }
}