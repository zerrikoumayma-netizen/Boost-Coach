package com.example.decathlon_project.DTO;

import java.time.LocalDateTime;

public record SessionResponse(
        Long id,
        boolean done,
        LocalDateTime completedAt,
        String sessionLabel,
        ProgramSummary program
) {}
