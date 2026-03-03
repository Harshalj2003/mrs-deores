package com.mrsdeores.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_verification_otps")
@Data
@NoArgsConstructor
public class EmailVerificationOTP {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String email;

    @Column(nullable = false, length = 4)
    private String otpCode;

    @Column(nullable = false)
    private LocalDateTime expiryTime;

    @Column(name = "attempts_count")
    private Integer attemptsCount = 0;

    @Column(name = "resend_count")
    private Integer resendCount = 1;

    @Column(name = "last_resend_at")
    private LocalDateTime lastResendAt = LocalDateTime.now();

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public EmailVerificationOTP(String email, String otpCode, int expiryMinutes) {
        this.email = email;
        this.otpCode = otpCode;
        this.expiryTime = LocalDateTime.now().plusMinutes(expiryMinutes);
    }
}
