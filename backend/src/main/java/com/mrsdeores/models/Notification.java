package com.mrsdeores.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(length = 50, nullable = false)
    private String type = "INFO"; // INFO, ALERT, SUCCESS, WARNING

    // If targetUser is null, it's a global broadcast to EVERYONE.
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "password", "roles" })
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id")
    private User targetUser;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "password", "roles" })
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;

    @Column(name = "attachment_url", length = 1000)
    private String attachmentUrl;

    @Column(name = "attachment_type", length = 20)
    private String attachmentType; // IMAGE, VIDEO, LINK

    public boolean isGlobal() {
        return targetUser == null;
    }
}
