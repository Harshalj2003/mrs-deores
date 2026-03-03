package com.mrsdeores.services;

import com.mrsdeores.models.EmailVerificationOTP;
import com.mrsdeores.repository.EmailVerificationOTPRepository;
import com.mrsdeores.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Random;

@Service
public class EmailVerificationService {
    private static final Logger logger = LoggerFactory.getLogger(EmailVerificationService.class);

    @Autowired
    private EmailVerificationOTPRepository otpRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Generates a 4-digit OTP and sends it to the user's email.
     * Enforces rate limit: 3 resends per 15 minutes.
     */
    @Transactional
    public void sendVerificationOTP(String email, String username) {
        String otp = String.format("%04d", new Random().nextInt(10000));

        var otpOpt = otpRepository.findByEmail(email);
        EmailVerificationOTP otpEntity;

        if (otpOpt.isPresent()) {
            otpEntity = otpOpt.get();
            LocalDateTime windowStart = LocalDateTime.now().minusMinutes(15);

            if (otpEntity.getLastResendAt().isAfter(windowStart)) {
                if (otpEntity.getResendCount() >= 3) {
                    logger.warn("OTP resend rate limit exceeded for {}", email);
                    throw new RuntimeException("Too many OTP requests. Please wait 15 minutes.");
                }
                otpEntity.setResendCount(otpEntity.getResendCount() + 1);
            } else {
                // Reset count if window has passed
                otpEntity.setResendCount(1);
            }
            otpEntity.setOtpCode(otp);
            otpEntity.setExpiryTime(LocalDateTime.now().plusMinutes(15));
            otpEntity.setLastResendAt(LocalDateTime.now());
            otpEntity.setAttemptsCount(0); // Reset verification attempts on new OTP
        } else {
            otpEntity = new EmailVerificationOTP(email, otp, 15);
        }

        otpRepository.save(otpEntity);

        // Send OTP asynchronously
        emailService.sendOtpEmail(email, username, otp);
        logger.info("Verification OTP persistence complete for {}", email);
    }

    /**
     * Verifies the provided OTP for the given email.
     */
    @Transactional
    public boolean verifyOTP(String email, String code) {
        var otpOpt = otpRepository.findByEmail(email);
        if (otpOpt.isEmpty())
            return false;

        EmailVerificationOTP otpEntity = otpOpt.get();

        // Check expiry
        if (otpEntity.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpRepository.delete(otpEntity);
            return false;
        }

        // Check code
        if (!otpEntity.getOtpCode().equals(code)) {
            otpEntity.setAttemptsCount(otpEntity.getAttemptsCount() + 1);
            if (otpEntity.getAttemptsCount() >= 5) {
                otpRepository.delete(otpEntity); // Lockout after 5 failed attempts
            } else {
                otpRepository.save(otpEntity);
            }
            return false;
        }

        // Success - Flip verification status
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            user.setIsEmailVerified(true);
            userRepository.save(user);
        });

        // Cleanup OTP
        otpRepository.delete(otpEntity);
        return true;
    }

    /**
     * Cleanup expired OTPs every hour.
     */
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanupExpiredOtps() {
        otpRepository.deleteByExpiryTimeBefore(LocalDateTime.now());
    }
}
