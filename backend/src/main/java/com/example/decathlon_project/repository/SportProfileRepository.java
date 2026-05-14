package com.example.decathlon_project.repository;

import com.example.decathlon_project.model.SportProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SportProfileRepository
    extends JpaRepository<SportProfile, Long>
{
    Optional<SportProfile> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
