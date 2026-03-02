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
    // (global broadcast)
    @Query("SELECT n FROM Notification n WHERE n.targetUser.id = :userId OR n.targetUser IS NULL ORDER BY n.createdAt DESC")
    Page<Notification> findRelevantNotifications(@Param("userId") Long userId, Pageable pageable);

    // For admin history
    Page<Notification> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
