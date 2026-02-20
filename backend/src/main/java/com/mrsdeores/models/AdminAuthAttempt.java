package com.mrsdeores.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_auth_attempts")
@Data
@NoArgsConstructor
public class AdminAuthAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50)
    private String email;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(nullable = false)
    private Boolean success = false;

    @Column(name = "attempted_at", updatable = false)
    private LocalDateTime attemptedAt = LocalDateTime.now();

    public AdminAuthAttempt(String email, String ipAddress, Boolean success) {
        this.email = email;
        this.ipAddress = ipAddress;
        this.success = success;
    }
}
