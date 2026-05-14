package com.example.decathlon_project.controller;


import com.example.decathlon_project.DTO.LoginRequest;
import com.example.decathlon_project.DTO.LoginResponse;
import com.example.decathlon_project.DTO.RegisterRequest;
import com.example.decathlon_project.model.User;
import com.example.decathlon_project.security.JwtUtil;
import com.example.decathlon_project.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(
            @Valid @RequestBody RegisterRequest request) {
        userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Compte créé avec succès."));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(), request.getPassword()));

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);

        User user = userService.getUserByUsername(request.getUsername());

        LoginResponse response = new LoginResponse(
                token,
                user.getUsername(),
                user.getRoles().stream().map(Enum::name).collect(Collectors.toSet()),
                user.getLoyaltyPoints()
        );
        return ResponseEntity.ok(response);
    }
}
