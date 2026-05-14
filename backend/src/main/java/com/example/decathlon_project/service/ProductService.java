package com.example.decathlon_project.service;


import com.example.decathlon_project.exception.ResourceNotFoundException;
import com.example.decathlon_project.DTO.ProductResponse;
import com.example.decathlon_project.model.Product;
import com.example.decathlon_project.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.HtmlUtils;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final JdbcTemplate jdbcTemplate;

    private static final Map<String, Integer> DEFAULT_CATALOGUE_STOCK = Map.of(
            "Casablanca", 12,
            "Rabat", 8,
            "Marrakech", 6,
            "Agadir", 5
    );

    private static final String CATALOGUE_SELECT = """
            SELECT
                id,
                `COLLIER SELLE  28,6 MM` AS name,
                `0` AS price,
                `Colliers selle v?lo` AS product_category,
                `cyclisme` AS universe,
                `< 100 MAD` AS price_range,
                `jpg?format=auto&amp;quality=40&amp;f=250x250` AS image_url
            FROM catalogue_produits
            WHERE id IS NOT NULL
            """;

    @Transactional(readOnly = true)
    public List<ProductResponse> findAllForCatalogue() {
        List<ProductResponse> catalogueProducts = queryCatalogue(CATALOGUE_SELECT);
        if (!catalogueProducts.isEmpty()) {
            return catalogueProducts;
        }
        return findAll().stream().map(this::toProductResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> findByCategoryForCatalogue(String category) {
        String sql = CATALOGUE_SELECT + """
                AND (
                    LOWER(`cyclisme`) = LOWER(?)
                    OR LOWER(`Colliers selle v?lo`) = LOWER(?)
                )
                """;
        List<ProductResponse> catalogueProducts = queryCatalogue(sql, category, category);
        if (!catalogueProducts.isEmpty()) {
            return catalogueProducts;
        }
        return findByCategory(category).stream().map(this::toProductResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> searchForCatalogue(String search) {
        String sql = CATALOGUE_SELECT + """
                AND (
                    LOWER(`COLLIER SELLE  28,6 MM`) LIKE LOWER(?)
                    OR LOWER(`Colliers selle v?lo`) LIKE LOWER(?)
                    OR LOWER(`cyclisme`) LIKE LOWER(?)
                )
                """;
        String pattern = "%" + search + "%";
        List<ProductResponse> catalogueProducts = queryCatalogue(sql, pattern, pattern, pattern);
        if (!catalogueProducts.isEmpty()) {
            return catalogueProducts;
        }
        return this.search(search).stream().map(this::toProductResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse findByIdForCatalogue(Long id) {
        Optional<ProductResponse> catalogueProduct = queryCatalogue(CATALOGUE_SELECT + " AND id = ?", id)
                .stream()
                .findFirst();
        return catalogueProduct.orElseGet(() -> toProductResponse(findById(id)));
    }

    @Transactional(readOnly = true)
    public List<Product> findAll() {
        return productRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit", id));
    }

    @Transactional(readOnly = true)
    public List<Product> findByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    @Transactional(readOnly = true)
    public List<Product> search(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    @Transactional
    public Product save(Product product) {
        return productRepository.save(product);
    }

    @Transactional
    public Product update(Long id, Product updated) {
        Product existing = findById(id);
        existing.setName(updated.getName());
        existing.setPrice(updated.getPrice());
        existing.setCategory(updated.getCategory());
        existing.setDescription(updated.getDescription());
        existing.setImageUrl(updated.getImageUrl());
        if (updated.getStockByCity() != null) {
            existing.getStockByCity().clear();
            existing.getStockByCity().putAll(updated.getStockByCity());
        }
        return productRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Produit", id);
        }
        productRepository.deleteById(id);
    }

    @Transactional
    public void updateStock(Long id, String city, int quantity) {
        Product product = findById(id);
        product.getStockByCity().put(city, quantity);
        productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public Map<String, Integer> checkAvailability(Long id) {
        if (catalogueProductExists(id)) {
            return new LinkedHashMap<>(DEFAULT_CATALOGUE_STOCK);
        }
        return productRepository.findById(id)
                .map(product -> normalizeStock(product.getStockByCity()))
                .orElseGet(LinkedHashMap::new);
    }

    @Transactional(readOnly = true)
    public boolean isAvailableInCity(Long id, String city) {
        if (catalogueProductExists(id)) {
            return DEFAULT_CATALOGUE_STOCK.getOrDefault(city, 0) > 0;
        }
        return productRepository.findById(id)
                .map(product -> normalizeStock(product.getStockByCity()).getOrDefault(city, 0) > 0)
                .orElse(false);
    }

    private List<ProductResponse> queryCatalogue(String sql, Object... args) {
        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                String category = rs.getString("universe");
                String productCategory = rs.getString("product_category");
                String priceRange = rs.getString("price_range");
                String description = String.join(" | ", List.of(
                        productCategory == null ? "Produit sportif" : productCategory,
                        priceRange == null ? "Prix catalogue" : priceRange
                ));

                return new ProductResponse(
                        rs.getLong("id"),
                        rs.getString("name"),
                        BigDecimal.valueOf(rs.getDouble("price")),
                        category,
                        description,
                        normalizeImageUrl(rs.getString("image_url")),
                        new LinkedHashMap<>(DEFAULT_CATALOGUE_STOCK)
                );
            }, args);
        } catch (DataAccessException ex) {
            return List.of();
        }
    }

    private ProductResponse toProductResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getCategory(),
                product.getDescription(),
                normalizeImageUrl(product.getImageUrl()),
                normalizeStock(product.getStockByCity())
        );
    }

    private boolean catalogueProductExists(Long id) {
        if (id == null) {
            return false;
        }
        return !queryCatalogue(CATALOGUE_SELECT + " AND id = ?", id).isEmpty();
    }

    private LinkedHashMap<String, Integer> normalizeStock(Map<String, Integer> stockByCity) {
        LinkedHashMap<String, Integer> stock = new LinkedHashMap<>();
        if (stockByCity != null) {
            stockByCity.forEach((city, quantity) ->
                    stock.put(city, quantity == null || quantity <= 0 ? 10 : quantity)
            );
        }
        if (stock.isEmpty()) {
            stock.putAll(DEFAULT_CATALOGUE_STOCK);
        }
        return stock;
    }

    private String normalizeImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return null;
        }
        return HtmlUtils.htmlUnescape(imageUrl);
    }
}
