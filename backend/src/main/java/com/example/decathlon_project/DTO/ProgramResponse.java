package com.example.decathlon_project.DTO;

public record ProgramResponse(
        Long id,
        String title,
        String description,
        String category,
        String objective,
        String level,
        String durationWeeks
) {}
