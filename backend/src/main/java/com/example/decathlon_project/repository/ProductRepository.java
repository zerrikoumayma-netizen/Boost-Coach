package com.example.decathlon_project.repository;


import com.example.decathlon_project.model.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Override
    @EntityGraph(attributePaths = "stockByCity")
    List<Product> findAll();

    @Override
    @EntityGraph(attributePaths = "stockByCity")
    Optional<Product> findById(Long id);

    @EntityGraph(attributePaths = "stockByCity")
    List<Product> findByCategory(String category);

    @EntityGraph(attributePaths = "stockByCity")
    List<Product> findByNameContainingIgnoreCase(String name);
}
