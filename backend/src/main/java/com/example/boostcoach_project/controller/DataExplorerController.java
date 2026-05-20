package com.example.boostcoach_project.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.sql.ResultSetMetaData;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/data")
@RequiredArgsConstructor
public class DataExplorerController {

    private final JdbcTemplate jdbcTemplate;

    private static final Map<String, String> TABLE_LABELS = new LinkedHashMap<>();

    static {
        TABLE_LABELS.put("agenda_events", "Evenements importes");
        TABLE_LABELS.put("catalogue_produits", "Catalogue produits");
        TABLE_LABELS.put("produits_reco", "Produits recommandes");
        TABLE_LABELS.put("stats_budget", "Statistiques budget");
        TABLE_LABELS.put("stats_events_ville", "Evenements par ville");
        TABLE_LABELS.put("stats_univers", "Statistiques univers");
        TABLE_LABELS.put("top_sports", "Top sports");
        TABLE_LABELS.put("ventes_digitales", "Ventes digitales");
        TABLE_LABELS.put("ventes_magasins", "Ventes magasins");
    }

    @GetMapping("/tables")
    public List<TableSummary> getTables() {
        return TABLE_LABELS.entrySet().stream()
                .map(entry -> new TableSummary(entry.getKey(), entry.getValue(), countRows(entry.getKey())))
                .toList();
    }

    @GetMapping("/tables/{tableName}")
    public TablePreview getTable(
            @PathVariable String tableName,
            @RequestParam(defaultValue = "25") int limit) {
        ensureAllowed(tableName);
        int safeLimit = Math.max(1, Math.min(limit, 100));
        String sql = "SELECT * FROM `" + tableName + "` LIMIT " + safeLimit;
        List<Map<String, Object>> rows;
        try {
            rows = jdbcTemplate.query(sql, (rs, rowNum) -> {
                ResultSetMetaData metaData = rs.getMetaData();
                Map<String, Object> row = new LinkedHashMap<>();
                for (int index = 1; index <= metaData.getColumnCount(); index++) {
                    row.put(metaData.getColumnLabel(index), rs.getObject(index));
                }
                return row;
            });
        } catch (DataAccessException ex) {
            rows = List.of();
        }
        return new TablePreview(tableName, TABLE_LABELS.get(tableName), countRows(tableName), rows);
    }

    private void ensureAllowed(String tableName) {
        if (!TABLE_LABELS.containsKey(tableName)) {
            throw new IllegalArgumentException("Table non autorisee: " + tableName);
        }
    }

    private long countRows(String tableName) {
        try {
            Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM `" + tableName + "`", Long.class);
            return count == null ? 0 : count;
        } catch (DataAccessException ex) {
            return 0;
        }
    }

    public record TableSummary(String name, String label, long rows) {}

    public record TablePreview(String name, String label, long totalRows, List<Map<String, Object>> rows) {}
}
