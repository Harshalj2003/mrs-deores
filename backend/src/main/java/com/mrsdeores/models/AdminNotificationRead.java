package com.mrsdeores.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "admin_notification_reads")
@Data
@NoArgsConstructor
public class AdminNotificationRead {

    @EmbeddedId
    private AdminNotificationReadId id;

    @Column(name = "read_at", updatable = false)
    private LocalDateTime readAt = LocalDateTime.now();

    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminNotificationReadId implements Serializable {
        @Column(name = "admin_username", length = 50)
        private String adminUsername;

        @Column(name = "notification_id")
        private Long notificationId;

        @Override
        public boolean equals(Object o) {
            if (this == o)
                return true;
            if (o == null || getClass() != o.getClass())
                return false;
            AdminNotificationReadId that = (AdminNotificationReadId) o;
            return Objects.equals(adminUsername, that.adminUsername) &&
                    Objects.equals(notificationId, that.notificationId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(adminUsername, notificationId);
        }
    }
}
