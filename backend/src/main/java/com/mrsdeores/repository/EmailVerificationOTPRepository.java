package com.mrsdeores.repository;

import com.mrsdeores.models.EmailVerificationOTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailVerificationOTPRepository extends JpaRepository<EmailVerificationOTP, Long> {
    Optional<EmailVerificationOTP> findByEmail(String email);

    void deleteByEmail(String email);

    void deleteByExpiryTimeBefore(LocalDateTime time);
}
