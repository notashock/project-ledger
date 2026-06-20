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
            return userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Current user not found"));
        }
        throw new RuntimeException("No authenticated user found");
    }
}
