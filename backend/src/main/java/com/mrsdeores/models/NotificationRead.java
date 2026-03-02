package com.mrsdeores.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_reads")
@Data
@NoArgsConstructor
public class NotificationRead {

    @EmbeddedId
    private NotificationReadId id;

    @Column(name = "read_at", updatable = false)
    private LocalDateTime readAt = LocalDateTime.now();

    @Embeddable
    @Data
    @NoArgsConstructor
    public static class NotificationReadId implements java.io.Serializable {
        @Column(name = "user_id")
        private Long userId;

        @Column(name = "notification_id")
        private Long notificationId;

        public NotificationReadId(Long userId, Long notificationId) {
            this.userId = userId;
            this.notificationId = notificationId;
        }
    }
}
