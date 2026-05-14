package com.example.decathlon_project.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "sport_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SportProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int age;

    @Column(length = 100)
    private String city;

    @Column(length = 120)
    private String hobby;

    private int budget;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "profile_objectives", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "objective")
    @Builder.Default
    private Set<String> objectives = new HashSet<>();

    @Enumerated(EnumType.STRING)
    private Level level;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    public enum Level {
        BEGINNER, INTERMEDIATE, ADVANCED
    }
}
