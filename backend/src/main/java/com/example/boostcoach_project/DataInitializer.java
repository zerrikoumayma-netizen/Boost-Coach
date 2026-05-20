package com.example.boostcoach_project;

import com.example.boostcoach_project.model.*;
import com.example.boostcoach_project.model.SportEvent.EventType;
import com.example.boostcoach_project.repository.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final TrainingProgramRepository programRepository;
    private final SportEventRepository eventRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        normalizeProductStock();

        if (userRepository.count() > 0) {
            log.info("Données déjà initialisées, skip.");
            return;
        }

        log.info("Initialisation des données de test...");

        // ── Utilisateurs ─────────────────────────────────────────────────────
        userRepository.save(
            User.builder()
                .username("admin")
                .email("admin@boostcoach.ma")
                .password(passwordEncoder.encode("admin123"))
                .roles(Set.of(Role.ROLE_ADMIN))
                .loyaltyPoints(0)
                .build()
        );

        userRepository.save(
            User.builder()
                .username("oum")
                .email("oum@sport.ma")
                .password(passwordEncoder.encode("oum123"))
                .roles(Set.of(Role.ROLE_USER))
                .loyaltyPoints(50)
                .build()
        );

        log.info("Utilisateurs créés : admin / oum");

        // ── Produits ─────────────────────────────────────────────────────────
        productRepository.save(
            Product.builder()
                .name("Vélo de route Triban RC 500")
                .price(BigDecimal.valueOf(599.99))
                .category("Cyclisme")
                .description("Vélo de route léger, idéal pour débuter.")
                .imageUrl(
                    "https://contents.mediaboostcoach.com/triban-rc500.jpg"
                )
                .stockByCity(
                    Map.of("Casablanca", 5, "Rabat", 3, "Marrakech", 2)
                )
                .build()
        );

        productRepository.save(
            Product.builder()
                .name("Chaussures de running Kiprun KS900")
                .price(BigDecimal.valueOf(89.99))
                .category("Running")
                .description(
                    "Chaussures hautes performances pour semi-marathon."
                )
                .stockByCity(Map.of("Casablanca", 12, "Rabat", 8))
                .build()
        );

        productRepository.save(
            Product.builder()
                .name("Tapis de yoga 5mm Domyos")
                .price(BigDecimal.valueOf(19.99))
                .category("Yoga & Pilates")
                .description("Tapis antidérapant, épaisseur confort 5mm.")
                .stockByCity(Map.of("Casablanca", 20, "Agadir", 10))
                .build()
        );

        productRepository.save(
            Product.builder()
                .name("Haltères réglables 20kg Corength")
                .price(BigDecimal.valueOf(149.99))
                .category("Musculation")
                .description("Jeu d'haltères avec disques amovibles.")
                .stockByCity(Map.of("Casablanca", 10, "Rabat", 4))
                .build()
        );

        log.info("Produits créés.");

        // ── Programmes d'entraînement ────────────────────────────────────────
        programRepository.save(
            TrainingProgram.builder()
                .title("Défi perte de poids 8 semaines")
                .description(
                    "Programme cardio + nutrition pour perdre du poids efficacement."
                )
                .category("Cardio")
                .objective("perte de poids")
                .level("BEGINNER")
                .durationWeeks("8")
                .build()
        );

        programRepository.save(
            TrainingProgram.builder()
                .title("Programme musculation full body")
                .description(
                    "3 séances par semaine pour développer toute la musculature."
                )
                .category("Musculation")
                .objective("musculation")
                .level("INTERMEDIATE")
                .durationWeeks("12")
                .build()
        );

        programRepository.save(
            TrainingProgram.builder()
                .title("Préparation marathon 10 semaines")
                .description(
                    "Plan d'entraînement progressif pour finir un marathon."
                )
                .category("Running")
                .objective("endurance")
                .level("ADVANCED")
                .durationWeeks("10")
                .build()
        );

        programRepository.save(
            TrainingProgram.builder()
                .title("Yoga & bien-être débutant")
                .description(
                    "Séances de yoga douces pour débutants, flexibilité et relaxation."
                )
                .category("Yoga & Pilates")
                .objective("flexibilité")
                .level("BEGINNER")
                .durationWeeks("6")
                .build()
        );

        log.info("Programmes d'entraînement créés.");

        // ── Événements sportifs ──────────────────────────────────────────────
        eventRepository.save(
            SportEvent.builder()
                .title("Marathon de Casablanca 2025")
                .type(EventType.MARATHON)
                .eventDate(LocalDate.of(2025, 10, 19))
                .city("Casablanca")
                .description(
                    "Course officielle 42km dans les rues de Casablanca."
                )
                .registrationUrl("https://marathon-casablanca.ma")
                .build()
        );

        eventRepository.save(
            SportEvent.builder()
                .title("Tournoi Beach Volley Agadir")
                .type(EventType.TOURNAMENT)
                .eventDate(LocalDate.of(2025, 7, 15))
                .city("Agadir")
                .description(
                    "Tournoi open de beach-volley sur la plage d'Agadir."
                )
                .build()
        );

        eventRepository.save(
            SportEvent.builder()
                .title("Atelier Nutrition Sportive BoostCoach Rabat")
                .type(EventType.WORKSHOP)
                .eventDate(LocalDate.of(2025, 6, 5))
                .city("Rabat")
                .description(
                    "Conférence animée par un nutritionniste partenaire BoostCoach."
                )
                .build()
        );

        log.info("Événements créés.");
        log.info(
            "✅ Initialisation terminée. Comptes : admin/admin123 | oum/oum123"
        );
    }

    private void normalizeProductStock() {
        int updatedRows = jdbcTemplate.update(
            "UPDATE product_stock SET quantity = 10 WHERE quantity <= 0"
        );
        if (updatedRows > 0) {
            log.info("Stock corrigÃ© pour {} produit(s) avec quantitÃ© nulle.", updatedRows);
        }
    }
}
