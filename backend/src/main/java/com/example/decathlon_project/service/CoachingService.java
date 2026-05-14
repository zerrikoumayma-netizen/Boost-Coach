package com.example.decathlon_project.service;


import com.example.decathlon_project.exception.ResourceNotFoundException;
import com.example.decathlon_project.model.Session;
import com.example.decathlon_project.model.TrainingProgram;
import com.example.decathlon_project.model.User;
import com.example.decathlon_project.repository.SessionRepository;
import com.example.decathlon_project.repository.TrainingProgramRepository;
import com.example.decathlon_project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CoachingService {

    private static final int POINTS_PER_SESSION = 10;

    private final TrainingProgramRepository programRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;

    // ── Programmes ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TrainingProgram> getAllPrograms() {
        return programRepository.findAll();
    }

    @Transactional(readOnly = true)
    public TrainingProgram getProgramById(Long id) {
        return programRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programme", id));
    }

    @Transactional(readOnly = true)
    public List<TrainingProgram> getProgramsByObjective(String objective) {
        return programRepository.findByObjectiveIgnoreCase(objective);
    }

    @Transactional(readOnly = true)
    public List<TrainingProgram> getProgramsByCategory(String category) {
        return programRepository.findByCategory(category);
    }

    @Transactional
    public TrainingProgram saveProgram(TrainingProgram program) {
        return programRepository.save(program);
    }

    @Transactional
    public void deleteProgram(Long id) {
        if (!programRepository.existsById(id)) {
            throw new ResourceNotFoundException("Programme", id);
        }
        programRepository.deleteById(id);
    }

    // ── Séances ─────────────────────────────────────────────────────────────

    @Transactional
    public Session startSession(Long userId, Long programId, String label) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", userId));
        TrainingProgram program = getProgramById(programId);

        Session session = Session.builder()
                .user(user)
                .program(program)
                .sessionLabel(label)
                .done(false)
                .build();
        Session savedSession = sessionRepository.save(session);
        return sessionRepository.findById(savedSession.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Séance", savedSession.getId()));
    }

    @Transactional
    public Session completeSession(Long sessionId, Long userId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Séance", sessionId));

        if (!session.getUser().getId().equals(userId)) {
            throw new SecurityException("Cette séance n'appartient pas à l'utilisateur.");
        }
        if (session.isDone()) {
            return session;
        }

        session.setDone(true);
        session.setCompletedAt(LocalDateTime.now());
        sessionRepository.save(session);

        // Incrémenter les points de fidélité
        User user = session.getUser();
        user.setLoyaltyPoints(user.getLoyaltyPoints() + POINTS_PER_SESSION);
        userRepository.save(user);

        return session;
    }

    @Transactional(readOnly = true)
    public List<Session> getUserSessions(Long userId) {
        return sessionRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<Session> getCompletedSessions(Long userId) {
        return sessionRepository.findByUserIdAndDone(userId, true);
    }

    @Transactional(readOnly = true)
    public long countCompletedSessions(Long userId) {
        return sessionRepository.countByUserIdAndDoneTrue(userId);
    }
}
