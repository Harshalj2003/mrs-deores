package com.mrsdeores.repository;

import com.mrsdeores.models.AdminAuthAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AdminAuthAttemptRepository extends JpaRepository<AdminAuthAttempt, Long> {
    long countByIpAddressAndAttemptedAtAfter(String ipAddress, LocalDateTime since);
}
