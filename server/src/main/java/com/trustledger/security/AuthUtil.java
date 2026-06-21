package com.trustledger.security;

import com.trustledger.model.AppUser;
import com.trustledger.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthUtil {

    private final UserRepository userRepository;

    public AppUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !authentication.getPrincipal().equals("anonymousUser")) {
            String username = authentication.getName();
            AppUser user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Current user not found"));
            
            // For data isolation: Standard users operate entirely within their admin's dataset
            if (user.getRole() == com.trustledger.model.enums.UserRole.ROLE_USER) {
                if (user.getAdmin() != null) {
                    return user.getAdmin();
                }
                // Fallback: If no creator admin is set, return the default "admin" user or first available admin
                AppUser defaultAdmin = userRepository.findByUsername("admin").orElse(null);
                if (defaultAdmin == null) {
                    defaultAdmin = userRepository.findAll().stream()
                            .filter(u -> u.getRole() == com.trustledger.model.enums.UserRole.ROLE_ADMIN)
                            .findFirst()
                            .orElse(null);
                }
                if (defaultAdmin != null) {
                    return defaultAdmin;
                }
            }
            return user;
        }
        throw new RuntimeException("No authenticated user found");
    }
}
