package com.mrsdeores.repository;

import com.mrsdeores.models.NotificationRead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationReadRepository
        extends JpaRepository<NotificationRead, NotificationRead.NotificationReadId> {

    // Find all read records for a specific user
    List<NotificationRead> findByIdUserId(Long userId);

    // Check if a specific notification is read by a user
    boolean existsByIdUserIdAndIdNotificationId(Long userId, Long notificationId);

    // Find all read records for a specific notification
    List<NotificationRead> findByIdNotificationId(Long notificationId);
}
