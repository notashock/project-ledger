package com.trustledger.controller;

import com.trustledger.dto.ApiResponseDto;
import com.trustledger.dto.AuthRequest;
import com.trustledger.dto.AuthResponse;
import com.trustledger.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<ApiResponseDto<AuthResponse>> login(@RequestBody AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String jwt = jwtUtil.generateToken(userDetails);

        AuthResponse authResponse = new AuthResponse(jwt, userDetails.getUsername());
        ApiResponseDto<AuthResponse> response = ApiResponseDto.success(
                HttpStatus.OK.value(),
                "Login successful",
                authResponse
        );

        return ResponseEntity.ok(response);
    }
}
