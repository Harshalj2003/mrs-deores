package com.mrsdeores.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    /** Grid size hint: SMALL, MEDIUM, LARGE, FEATURED */
    @Column(name = "grid_size", length = 20)
    private String gridSize = "MEDIUM";

    /** View mode: AUTO, MANUAL */
    @Column(name = "view_mode", length = 20)
    private String viewMode = "AUTO";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Category(String name, String description, String imageUrl) {
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
    }
}
