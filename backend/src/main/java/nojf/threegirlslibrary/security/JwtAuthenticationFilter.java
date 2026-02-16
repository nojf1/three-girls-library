package nojf.threegirlslibrary.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtTokenProvider tokenProvider;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        try {
            String jwt = getJwtFromRequest(request);
            
            if (StringUtils.hasText(jwt)) {
                log.info("JWT token found in request header for path: {}", request.getRequestURI());
                boolean isValid = tokenProvider.validateToken(jwt);
                log.info("JWT validation result: {}", isValid);
                
                if (isValid) {
                    Long userId = tokenProvider.getUserIdFromToken(jwt);
                    String role = tokenProvider.getRoleFromToken(jwt);
                    
                    log.info("Authenticating user - ID: {}, Role: {}", userId, role);
                    
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
                    
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userId, null, Collections.singletonList(authority));
                    
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.info("User authenticated successfully with role: ROLE_{}", role);
                }
            } else {
                log.debug("No JWT token found in request header for path: {}", request.getRequestURI());
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context for path: " + request.getRequestURI(), ex);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}