package com.example.boostcoach_project.service;

import com.example.boostcoach_project.exception.ResourceNotFoundException;
import com.example.boostcoach_project.model.SportEvent;
import com.example.boostcoach_project.model.SportEvent.EventType;
import com.example.boostcoach_project.repository.SportEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SportEventService {

    private final SportEventRepository eventRepository;
    private final JdbcTemplate jdbcTemplate;

    private static final String AGENDA_SELECT = """
            SELECT
                id,
                nom_evenement,
                ville,
                sport,
                date,
                description,
                lien_event
            FROM agenda_events
            WHERE id IS NOT NULL
            """;

    @Transactional(readOnly = true)
    public List<SportEvent> findAll() {
        List<SportEvent> agendaEvents = queryAgendaEvents(AGENDA_SELECT);
        return agendaEvents.isEmpty() ? eventRepository.findAll() : agendaEvents;
    }

    @Transactional(readOnly = true)
    public SportEvent findById(Long id) {
        Optional<SportEvent> agendaEvent = queryAgendaEvents(AGENDA_SELECT + " AND id = ?", id)
                .stream()
                .findFirst();
        return agendaEvent.orElseGet(() -> eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement", id)));
    }

    @Transactional(readOnly = true)
    public List<SportEvent> findUpcoming() {
        List<SportEvent> agendaEvents = queryAgendaEvents(AGENDA_SELECT + " AND STR_TO_DATE(date, '%Y-%m-%d') >= CURDATE() ORDER BY STR_TO_DATE(date, '%Y-%m-%d') ASC");
        return agendaEvents.isEmpty() ? eventRepository.findByEventDateAfterOrderByEventDateAsc(LocalDate.now()) : agendaEvents;
    }

    @Transactional(readOnly = true)
    public List<SportEvent> findByType(EventType type) {
        List<SportEvent> agendaEvents = queryAgendaEvents(AGENDA_SELECT + agendaTypePredicate(type), agendaTypeArgs(type));
        return agendaEvents.isEmpty() ? eventRepository.findByType(type) : agendaEvents;
    }

    @Transactional(readOnly = true)
    public List<SportEvent> findByCity(String city) {
        List<SportEvent> agendaEvents = queryAgendaEvents(AGENDA_SELECT + " AND LOWER(ville) = LOWER(?)", city);
        return agendaEvents.isEmpty() ? eventRepository.findByCityIgnoreCase(city) : agendaEvents;
    }

    @Transactional(readOnly = true)
    public List<SportEvent> findImported(String city, EventType type, boolean upcomingOnly) {
        StringBuilder sql = new StringBuilder(AGENDA_SELECT);
        List<Object> args = new ArrayList<>();
        if (city != null && !city.isBlank()) {
            sql.append(" AND LOWER(ville) = LOWER(?)");
            args.add(city);
        }
        if (type != null) {
            sql.append(agendaTypePredicate(type));
            args.addAll(List.of(agendaTypeArgs(type)));
        }
        if (upcomingOnly) {
            sql.append(" AND STR_TO_DATE(date, '%Y-%m-%d') >= CURDATE()");
        }
        sql.append(" ORDER BY STR_TO_DATE(date, '%Y-%m-%d') ASC");

        List<SportEvent> agendaEvents = queryAgendaEvents(sql.toString(), args.toArray());
        if (!agendaEvents.isEmpty()) {
            return agendaEvents;
        }
        if (upcomingOnly) {
            return findUpcoming();
        }
        if (city != null && !city.isBlank()) {
            return findByCity(city);
        }
        if (type != null) {
            return findByType(type);
        }
        return eventRepository.findAll();
    }

    @Transactional
    public SportEvent create(SportEvent event) {
        return eventRepository.save(event);
    }

    @Transactional
    public SportEvent update(Long id, SportEvent updated) {
        SportEvent existing = findById(id);
        existing.setTitle(updated.getTitle());
        existing.setType(updated.getType());
        existing.setEventDate(updated.getEventDate());
        existing.setCity(updated.getCity());
        existing.setDescription(updated.getDescription());
        existing.setRegistrationUrl(updated.getRegistrationUrl());
        return eventRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new ResourceNotFoundException("Evenement", id);
        }
        eventRepository.deleteById(id);
    }

    private List<SportEvent> queryAgendaEvents(String sql, Object... args) {
        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> SportEvent.builder()
                    .id(rs.getLong("id"))
                    .title(rs.getString("nom_evenement"))
                    .city(rs.getString("ville"))
                    .type(toEventType(rs.getString("sport")))
                    .eventDate(toLocalDate(rs.getString("date")))
                    .description(rs.getString("description"))
                    .registrationUrl(rs.getString("lien_event"))
                    .build(), args);
        } catch (DataAccessException ex) {
            return List.of();
        }
    }

    private EventType toEventType(String sport) {
        String value = sport == null ? "" : sport.toLowerCase(Locale.ROOT);
        if (value.contains("running") || value.contains("marathon") || value.contains("trail")) {
            return EventType.MARATHON;
        }
        if (value.contains("tournament") || value.contains("football") || value.contains("padel") || value.contains("golf")) {
            return EventType.TOURNAMENT;
        }
        if (value.contains("yoga") || value.contains("well") || value.contains("fitness")) {
            return EventType.WORKSHOP;
        }
        return EventType.OTHER;
    }

    private String agendaTypePredicate(EventType type) {
        return switch (type) {
            case MARATHON -> " AND (LOWER(sport) LIKE ? OR LOWER(sport) LIKE ? OR LOWER(sport) LIKE ?)";
            case TOURNAMENT -> " AND (LOWER(sport) LIKE ? OR LOWER(sport) LIKE ? OR LOWER(sport) LIKE ?)";
            case WORKSHOP -> " AND (LOWER(sport) LIKE ? OR LOWER(sport) LIKE ? OR LOWER(sport) LIKE ?)";
            case OTHER -> " AND LOWER(sport) NOT LIKE ? AND LOWER(sport) NOT LIKE ? AND LOWER(sport) NOT LIKE ?";
        };
    }

    private Object[] agendaTypeArgs(EventType type) {
        return switch (type) {
            case MARATHON -> new Object[]{"%running%", "%marathon%", "%trail%"};
            case TOURNAMENT -> new Object[]{"%football%", "%padel%", "%golf%"};
            case WORKSHOP -> new Object[]{"%yoga%", "%fitness%", "%well%"};
            case OTHER -> new Object[]{"%running%", "%football%", "%yoga%"};
        };
    }

    private LocalDate toLocalDate(String value) {
        if (value == null || value.isBlank()) {
            return LocalDate.now();
        }
        String trimmed = value.trim();
        try {
            return LocalDate.parse(trimmed.substring(0, Math.min(trimmed.length(), 10)));
        } catch (DateTimeParseException ex) {
            return LocalDate.now();
        }
    }
}
