package com.example.decathlon_project.repository;

import com.example.decathlon_project.model.TrainingProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingProgramRepository extends JpaRepository<TrainingProgram, Long> {
    List<TrainingProgram> findByObjectiveIgnoreCase(String objective);
    List<TrainingProgram> findByCategory(String category);
    List<TrainingProgram> findByLevel(String level);
}