package com.example.boostcoach_project.controller;

import com.example.boostcoach_project.model.SportEvent;
import com.example.boostcoach_project.model.SportEvent.EventType;
import com.example.boostcoach_project.service.SportEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final SportEventService eventService;

    @GetMapping
    public ResponseEntity<List<SportEvent>> getAll(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) EventType type,
            @RequestParam(required = false, defaultValue = "false") boolean upcomingOnly) {
        return ResponseEntity.ok(eventService.findImported(city, type, upcomingOnly));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SportEvent> getById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.findById(id));
    }

    // ── Admin uniquement (contrôlé par SecurityConfig) ───────────────────────

    @PostMapping
    public ResponseEntity<SportEvent> create(@RequestBody SportEvent event) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(eventService.create(event));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SportEvent> update(
            @PathVariable Long id,
            @RequestBody SportEvent event) {
        return ResponseEntity.ok(eventService.update(id, event));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        eventService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
