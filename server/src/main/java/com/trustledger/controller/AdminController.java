package com.trustledger.controller;

import com.trustledger.dto.ApiResponseDto;
import com.trustledger.dto.CreateUserDto;
import com.trustledger.model.AppUser;
import com.trustledger.model.enums.UserRole;
import com.trustledger.repository.UserRepository;
import com.trustledger.security.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthUtil authUtil;

    @GetMapping("/users")
    public ResponseEntity<ApiResponseDto<List<AppUser>>> getAllUsers() {
        AppUser currentUser = authUtil.getCurrentUser();
        List<AppUser> users = new java.util.ArrayList<>();
        users.add(currentUser);
        users.addAll(userRepository.findByAdmin(currentUser));
        ApiResponseDto<List<AppUser>> response = ApiResponseDto.success(
                HttpStatus.OK.value(),
                "Users retrieved successfully",
                users
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponseDto<AppUser>> createUser(@RequestBody CreateUserDto request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body((ApiResponseDto) ApiResponseDto.error(
                            HttpStatus.BAD_REQUEST.value(),
                            "Username already exists",
                            null
                    ));
        }

        UserRole assignedRole = UserRole.ROLE_USER;
        if (request.getRole() != null) {
            try {
                assignedRole = UserRole.valueOf(request.getRole());
            } catch (IllegalArgumentException e) {
                // Keep default ROLE_USER
            }
        }

        AppUser newUser = AppUser.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(assignedRole)
                .admin(authUtil.getCurrentUser())
                .build();

        AppUser savedUser = userRepository.save(newUser);
        ApiResponseDto<AppUser> response = ApiResponseDto.success(
                HttpStatus.CREATED.value(),
                "User created successfully",
                savedUser
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponseDto<Void>> deleteUser(@PathVariable("id") UUID id) {
        AppUser currentUser = authUtil.getCurrentUser();
        if (currentUser.getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body((ApiResponseDto) ApiResponseDto.error(
                            HttpStatus.BAD_REQUEST.value(),
                            "You cannot delete your own account",
                            null
                    ));
        }

        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body((ApiResponseDto) ApiResponseDto.error(
                            HttpStatus.NOT_FOUND.value(),
                            "User not found",
                            null
                    ));
        }

        userRepository.deleteById(id);
        ApiResponseDto<Void> response = ApiResponseDto.success(
                HttpStatus.OK.value(),
                "User deleted successfully",
                null
        );
        return ResponseEntity.ok(response);
    }
}
