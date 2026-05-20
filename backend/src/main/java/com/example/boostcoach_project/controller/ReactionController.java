package com.example.boostcoach_project.controller;

import com.example.boostcoach_project.model.TargetType;
import com.example.boostcoach_project.model.User;
import com.example.boostcoach_project.service.ReactionService;
import com.example.boostcoach_project.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reactions")
@RequiredArgsConstructor
public class ReactionController {

    private final ReactionService reactionService;
    private final UserService userService;

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Object>> toggle(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Long targetId,
            @RequestParam TargetType targetType) {

        User user = userService.getUserByUsername(userDetails.getUsername());
        boolean active = reactionService.toggleReaction(user.getId(), targetId, targetType); // ✅ minuscule
        long count = reactionService.countReactions(targetId, targetType);
        return ResponseEntity.ok(Map.of(
                "active", active,
                "count", count,
                "targetId", targetId,
                "targetType", targetType
        ));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Long targetId,
            @RequestParam TargetType targetType) {

        User user = userService.getUserByUsername(userDetails.getUsername());
        return ResponseEntity.ok(
                reactionService.getReactionSummary(user.getId(), targetId, targetType));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getCount(
            @RequestParam Long targetId,
            @RequestParam TargetType targetType) {

        long count = reactionService.countReactions(targetId, targetType);
        return ResponseEntity.ok(Map.of("count", count));
    }
}