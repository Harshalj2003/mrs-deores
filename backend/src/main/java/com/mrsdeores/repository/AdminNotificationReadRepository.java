package com.mrsdeores.repository;

import com.mrsdeores.models.AdminNotificationRead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminNotificationReadRepository
        extends JpaRepository<AdminNotificationRead, AdminNotificationRead.AdminNotificationReadId> {
    List<AdminNotificationRead> findByIdNotificationId(Long notificationId);

    List<AdminNotificationRead> findByIdAdminUsername(String adminUsername);

    boolean existsByIdAdminUsernameAndIdNotificationId(String adminUsername, Long notificationId);
}
