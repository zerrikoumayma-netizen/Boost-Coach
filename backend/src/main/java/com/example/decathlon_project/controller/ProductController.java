package com.example.decathlon_project.controller;


import com.example.decathlon_project.DTO.ProductResponse;
import com.example.decathlon_project.model.Product;
import com.example.decathlon_project.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAll(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(productService.searchForCatalogue(search));
        }
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(productService.findByCategoryForCatalogue(category));
        }
        return ResponseEntity.ok(productService.findAllForCatalogue());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.findByIdForCatalogue(id));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<Map<String, Integer>> checkAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(productService.checkAvailability(id));
    }

    @GetMapping("/{id}/availability/{city}")
    public ResponseEntity<Map<String, Object>> isAvailableInCity(
            @PathVariable Long id,
            @PathVariable String city) {
        boolean available = productService.isAvailableInCity(id, city);
        return ResponseEntity.ok(Map.of(
                "city", city,
                "available", available
        ));
    }

    // ── Admin uniquement (contrôlé par SecurityConfig) ───────────────────────

    @PostMapping
    public ResponseEntity<ProductResponse> create(@RequestBody Product product) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toProductResponse(productService.save(product)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(
            @PathVariable Long id,
            @RequestBody Product product) {
        return ResponseEntity.ok(toProductResponse(productService.update(id, product)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<Map<String, String>> updateStock(
            @PathVariable Long id,
            @RequestParam String city,
            @RequestParam int quantity) {
        productService.updateStock(id, city, quantity);
        return ResponseEntity.ok(Map.of("message", "Stock mis à jour."));
    }

    private ProductResponse toProductResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getCategory(),
                product.getDescription(),
                product.getImageUrl(),
                product.getStockByCity()
        );
    }
}
