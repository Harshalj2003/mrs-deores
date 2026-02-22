package com.mrsdeores.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_invitations")
@Data
@NoArgsConstructor
public class AdminInvitation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String email;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(name = "invite_token", nullable = false, unique = true)
    private String inviteToken;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private Boolean used = false;

    @Column(nullable = true, length = 20, unique = true)
    private String username;

    @Column(nullable = true, length = 120)
    private String password;

    @Column(name = "session_expires_at")
    private LocalDateTime sessionExpiresAt;

    @Column(name = "is_fully_enrolled", nullable = false)
    private Boolean isFullyEnrolled = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isSessionExpired() {
        return sessionExpiresAt == null || LocalDateTime.now().isAfter(sessionExpiresAt);
    }
}
