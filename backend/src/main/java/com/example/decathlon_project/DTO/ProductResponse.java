package com.example.decathlon_project.DTO;

import java.math.BigDecimal;
import java.util.Map;

public record ProductResponse(
        Long id,
        String name,
        BigDecimal price,
        String category,
        String description,
        String imageUrl,
        Map<String, Integer> stockByCity
) {}
