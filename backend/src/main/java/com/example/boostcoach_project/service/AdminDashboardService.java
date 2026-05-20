package com.example.boostcoach_project.service;


import com.example.boostcoach_project.repository.ProductRepository;
import com.example.boostcoach_project.repository.SessionRepository;
import com.example.boostcoach_project.repository.SportEventRepository;
import com.example.boostcoach_project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final SessionRepository sessionRepository;
    private final SportEventRepository eventRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getStats() {
        long totalUsers    = userRepository.count();
        long totalProducts = productRepository.count();
        long totalSessions = sessionRepository.count();
        long totalEvents   = eventRepository.count();
        long doneSessions  = sessionRepository.findAll().stream()
                .filter(s -> s.isDone()).count();

        return Map.of(
                "totalUsers",    totalUsers,
                "totalProducts", totalProducts,
                "totalSessions", totalSessions,
                "completedSessions", doneSessions,
                "totalEvents",   totalEvents
        );
    }

    @Transactional(readOnly = true)
    public long countUsers() {
        return userRepository.count();
    }

    @Transactional(readOnly = true)
    public long countProducts() {
        return productRepository.count();
    }
}