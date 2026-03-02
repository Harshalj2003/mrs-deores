package com.mrsdeores.repository;

import com.mrsdeores.models.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Fetch all notifications meant for a specific user OR meant for everyone
    // (global broadcast), excluding ones they've marked as deleted
    @Query("SELECT n FROM Notification n WHERE (n.targetUser.id = :userId OR (n.targetUser IS NULL AND n.targetAdminUsername IS NULL)) AND NOT EXISTS (SELECT 1 FROM NotificationRead nr WHERE nr.id.notificationId = n.id AND nr.id.userId = :userId AND nr.isDeleted = true) ORDER BY n.createdAt DESC")
    Page<Notification> findRelevantUserNotifications(@Param("userId") Long userId, Pageable pageable);

    // Fetch all notifications meant for a specific Admin (by username) OR meant for
    // everyone (global broadcast), excluding ones they've marked as deleted
    @Query("SELECT n FROM Notification n WHERE (n.targetAdminUsername = :adminUsername OR (n.targetUser IS NULL AND n.targetAdminUsername IS NULL)) AND NOT EXISTS (SELECT 1 FROM AdminNotificationRead anr WHERE anr.id.notificationId = n.id AND anr.id.adminUsername = :adminUsername AND anr.isDeleted = true) ORDER BY n.createdAt DESC")
    Page<Notification> findRelevantAdminNotifications(@Param("adminUsername") String adminUsername, Pageable pageable);

    // For admin history
    Page<Notification> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
