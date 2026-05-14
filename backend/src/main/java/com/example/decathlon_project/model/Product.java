package com.example.decathlon_project.model;


import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(length = 100)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 255)
    private String imageUrl;

    @ElementCollection
    @CollectionTable(name = "product_stock", joinColumns = @JoinColumn(name = "product_id"))
    @MapKeyColumn(name = "city")
    @Column(name = "quantity")
    @Builder.Default
    private Map<String, Integer> stockByCity = new HashMap<>();
}