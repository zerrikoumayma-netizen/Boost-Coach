package com.example.boostcoach_project.repository;

import com.example.boostcoach_project.model.Reaction;
import com.example.boostcoach_project.model.TargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    Optional<Reaction> findByUserIdAndTargetIdAndTargetType(Long userId, Long targetId, TargetType targetType);
    List<Reaction> findByTargetIdAndTargetType(Long targetId, TargetType targetType);
    long countByTargetIdAndTargetType(Long targetId, TargetType targetType);
    boolean existsByUserIdAndTargetIdAndTargetType(Long userId, Long targetId, TargetType targetType);
}