package com.example.decathlon_project.repository;

import com.example.decathlon_project.model.SportEvent;
import com.example.decathlon_project.model.SportEvent.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SportEventRepository extends JpaRepository<SportEvent, Long> {
    List<SportEvent> findByEventDateAfterOrderByEventDateAsc(LocalDate date);
    List<SportEvent> findByType(EventType type);
    List<SportEvent> findByCityIgnoreCase(String city);
}   