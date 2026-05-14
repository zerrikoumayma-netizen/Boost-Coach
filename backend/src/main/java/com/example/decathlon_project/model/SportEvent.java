package com.example.decathlon_project.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "sport_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SportEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EventType type;

    @Column(nullable = false)
    private LocalDate eventDate;

    @Column(length = 100)
    private String city;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 255)
    private String registrationUrl;

    public enum EventType {
        MARATHON, TOURNAMENT, WORKSHOP, OTHER
    }
}