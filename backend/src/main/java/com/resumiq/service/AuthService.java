package com.resumiq.service;

import com.resumiq.domain.entity.User;
import com.resumiq.domain.enums.AccountStatus;
import com.resumiq.domain.enums.UserRole;
import com.resumiq.dto.auth.JwtResponse;
import com.resumiq.dto.auth.LoginRequest;
import com.resumiq.exception.BadRequestException;
import com.resumiq.exception.ResourceNotFoundException;
import com.resumiq.repository.UserRepository;
import com.resumiq.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public JwtResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        if (user.getStatus() != AccountStatus.ACTIVE) {
            throw new BadRequestException("Account is inactive. Contact administrator.");
        }

        user.setLastActive(Instant.now());
        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user);

        return JwtResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(86400L)
                .user(JwtResponse.UserInfo.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .department(user.getDepartment())
                        .build())
                .build();
    }

    public void forgotPassword(String email) {
        if (!userRepository.existsByEmail(email)) {
            throw new ResourceNotFoundException("No account found with email: " + email);
        }
    }

    public void resetPassword(String token, String newPassword) {
        if (!jwtTokenProvider.validateToken(token)) {
            throw new BadRequestException("Invalid or expired reset token");
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
