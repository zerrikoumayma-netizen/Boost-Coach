package com.example.decathlon_project.controller;
import com.example.decathlon_project.DTO.ProgramResponse;
import com.example.decathlon_project.DTO.ProgramSummary;
import com.example.decathlon_project.DTO.SessionResponse;
import com.example.decathlon_project.model.Session;
import com.example.decathlon_project.model.TrainingProgram;
import com.example.decathlon_project.model.User;
import com.example.decathlon_project.service.CoachingService;
import com.example.decathlon_project.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/coaching")
@RequiredArgsConstructor
public class CoachingController {

    private final CoachingService coachingService;
    private final UserService userService;

    // ── Programmes ──────────────────────────────────────────────────────────

    @GetMapping("/programs")
    public ResponseEntity<List<ProgramResponse>> getPrograms(
            @RequestParam(required = false) String objective,
            @RequestParam(required = false) String category) {
        if (objective != null && !objective.isBlank()) {
            return ResponseEntity.ok(toProgramResponses(coachingService.getProgramsByObjective(objective)));
        }
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(toProgramResponses(coachingService.getProgramsByCategory(category)));
        }
        return ResponseEntity.ok(toProgramResponses(coachingService.getAllPrograms()));
    }

    @GetMapping("/programs/{id}")
    public ResponseEntity<ProgramResponse> getProgramById(@PathVariable Long id) {
        return ResponseEntity.ok(toProgramResponse(coachingService.getProgramById(id)));
    }

    @PostMapping("/programs")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ProgramResponse> createProgram(
            @RequestBody TrainingProgram program) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toProgramResponse(coachingService.saveProgram(program)));
    }

    @DeleteMapping("/programs/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteProgram(@PathVariable Long id) {
        coachingService.deleteProgram(id);
        return ResponseEntity.noContent().build();
    }

    // ── Séances de l'utilisateur connecté ───────────────────────────────────

    @GetMapping("/sessions")
    public ResponseEntity<List<SessionResponse>> getMySessions(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByUsername(userDetails.getUsername());
        return ResponseEntity.ok(toSessionResponses(coachingService.getUserSessions(user.getId())));
    }

    @PostMapping("/sessions/start")
    public ResponseEntity<SessionResponse> startSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Long programId,
            @RequestParam(required = false, defaultValue = "") String label) {
        User user = userService.getUserByUsername(userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toSessionResponse(coachingService.startSession(user.getId(), programId, label)));
    }

    @PostMapping("/sessions/{sessionId}/complete")
    public ResponseEntity<Map<String, Object>> completeSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long sessionId) {
        User user = userService.getUserByUsername(userDetails.getUsername());
        Session session = coachingService.completeSession(sessionId, user.getId());
        return ResponseEntity.ok(Map.of(
                "message", "Séance terminée ! +10 points de fidélité.",
                "sessionId", session.getId(),
                "loyaltyPoints", user.getLoyaltyPoints() + 10
        ));
    }

    @GetMapping("/sessions/stats")
    public ResponseEntity<Map<String, Object>> getSessionStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByUsername(userDetails.getUsername());
        long completed = coachingService.countCompletedSessions(user.getId());
        return ResponseEntity.ok(Map.of(
                "completedSessions", completed,
                "loyaltyPoints", user.getLoyaltyPoints()
        ));
    }

    private List<ProgramResponse> toProgramResponses(List<TrainingProgram> programs) {
        return programs.stream()
                .map(this::toProgramResponse)
                .collect(Collectors.toList());
    }

    private ProgramResponse toProgramResponse(TrainingProgram program) {
        return new ProgramResponse(
                program.getId(),
                program.getTitle(),
                program.getDescription(),
                program.getCategory(),
                program.getObjective(),
                program.getLevel(),
                program.getDurationWeeks()
        );
    }

    private List<SessionResponse> toSessionResponses(List<Session> sessions) {
        return sessions.stream()
                .map(this::toSessionResponse)
                .collect(Collectors.toList());
    }

    private SessionResponse toSessionResponse(Session session) {
        return new SessionResponse(
                session.getId(),
                session.isDone(),
                session.getCompletedAt(),
                session.getSessionLabel(),
                session.getProgram() == null ? null : new ProgramSummary(
                        session.getProgram().getId(),
                        session.getProgram().getTitle()
                )
        );
    }
}
