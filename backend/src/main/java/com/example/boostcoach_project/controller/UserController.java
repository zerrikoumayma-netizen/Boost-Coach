package com.example.boostcoach_project.controller;


import com.example.boostcoach_project.DTO.SportProfileDTO;
import com.example.boostcoach_project.model.SportProfile;
import com.example.boostcoach_project.model.User;
import com.example.boostcoach_project.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ── Profil de l'utilisateur connecté ────────────────────────────────────

    @GetMapping("/me")
    public ResponseEntity<User> getMe(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getUserByUsername(userDetails.getUsername()));
    }

    @GetMapping("/me/profile")
    public ResponseEntity<SportProfile> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getProfile(userDetails.getUsername()));
    }

    @PutMapping("/me/profile")
    public ResponseEntity<SportProfile> saveProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SportProfileDTO dto) {
        SportProfile profile = userService.saveOrUpdateProfile(userDetails.getUsername(), dto);
        return ResponseEntity.ok(profile);
    }

    // ── Accessible uniquement en admin (via @PreAuthorize ou SecurityConfig) ─

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}
