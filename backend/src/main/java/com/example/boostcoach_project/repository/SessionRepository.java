package com.example.boostcoach_project.repository;


import com.example.boostcoach_project.model.Session;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    @Override
    @EntityGraph(attributePaths = {"program"})
    Optional<Session> findById(Long id);

    @EntityGraph(attributePaths = {"program"})
    List<Session> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"program"})
    List<Session> findByUserIdAndDone(Long userId, boolean done);

    @EntityGraph(attributePaths = {"program"})
    List<Session> findByProgramId(Long programId);

    long countByUserIdAndDoneTrue(Long userId);
}
