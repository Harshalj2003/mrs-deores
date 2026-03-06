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

    @Autowired
    private RateLimitConfigService rateLimitConfig;

    /**
     * Generates a 4-digit OTP and sends it to the user's email.
     * Enforces rate limit: 3 resends per 15 minutes.
     */
    @Transactional
    public void sendVerificationOTP(String email, String username) {
        String otp = generateOtpOnly(email);

        // Send OTP asynchronously
        emailService.sendOtpEmail(email, username, otp);
        logger.info("Verification OTP persistence complete for {}", email);
    }

    /**
     * Generates a 4-digit OTP and stores it in DB (with rate limiting),
     * but does NOT send any email. Use this when a custom email template
     * will be sent separately (e.g. Default Admin OTP).
     *
     * @return the generated OTP code
     */
    @Transactional
    public String generateOtpOnly(String email) {
        String otp = String.format("%04d", new Random().nextInt(10000));

        var otpOpt = otpRepository.findByEmail(email);
        EmailVerificationOTP otpEntity;

        if (otpOpt.isPresent()) {
            otpEntity = otpOpt.get();
            int windowMinutes = rateLimitConfig.getOtpWindowMinutes();
            int maxResends = rateLimitConfig.getOtpMaxResends();
            LocalDateTime windowStart = LocalDateTime.now().minusMinutes(windowMinutes);

            if (otpEntity.getLastResendAt().isAfter(windowStart)) {
                if (otpEntity.getResendCount() >= maxResends) {
                    logger.warn("OTP resend rate limit exceeded for {}", email);
                    throw new RuntimeException("Too many OTP requests. Please wait " + windowMinutes + " minutes.");
                }
                otpEntity.setResendCount(otpEntity.getResendCount() + 1);
            } else {
                // Reset count if window has passed
                otpEntity.setResendCount(1);
            }
            otpEntity.setOtpCode(otp);
            otpEntity.setExpiryTime(LocalDateTime.now().plusMinutes(windowMinutes));
            otpEntity.setLastResendAt(LocalDateTime.now());
            otpEntity.setAttemptsCount(0); // Reset verification attempts on new OTP
        } else {
            otpEntity = new EmailVerificationOTP(email, otp, rateLimitConfig.getOtpWindowMinutes());
        }

        otpRepository.save(otpEntity);
        logger.info("OTP generated and persisted for {} (no email sent)", email);
        return otp;
    }

    /**
     * Overloaded generateOtpOnly with custom rate limit parameters.
     * Used for Default Admin OTP which has its own configurable limits.
     *
     * @param maxResends    Max resend attempts allowed within the window
     * @param windowMinutes Duration of the rate limit window in minutes
     * @return the generated OTP code
     */
    @Transactional
    public String generateOtpOnly(String email, int maxResends, int windowMinutes) {
        String otp = String.format("%04d", new Random().nextInt(10000));

        var otpOpt = otpRepository.findByEmail(email);
        EmailVerificationOTP otpEntity;

        if (otpOpt.isPresent()) {
            otpEntity = otpOpt.get();
            LocalDateTime windowStart = LocalDateTime.now().minusMinutes(windowMinutes);

            if (otpEntity.getLastResendAt().isAfter(windowStart)) {
                if (otpEntity.getResendCount() >= maxResends) {
                    logger.warn("OTP resend rate limit exceeded for {} (custom limits)", email);
                    throw new RuntimeException("Too many OTP requests. Please wait " + windowMinutes + " minutes.");
                }
                otpEntity.setResendCount(otpEntity.getResendCount() + 1);
            } else {
                otpEntity.setResendCount(1);
            }
            otpEntity.setOtpCode(otp);
            otpEntity.setExpiryTime(LocalDateTime.now().plusMinutes(windowMinutes));
            otpEntity.setLastResendAt(LocalDateTime.now());
            otpEntity.setAttemptsCount(0);
        } else {
            otpEntity = new EmailVerificationOTP(email, otp, windowMinutes);
        }

        otpRepository.save(otpEntity);
        logger.info("OTP generated and persisted for {} with custom limits (no email sent)", email);
        return otp;
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
            if (otpEntity.getAttemptsCount() >= rateLimitConfig.getOtpMaxVerifyAttempts()) {
                otpRepository.delete(otpEntity); // Lockout after max failed attempts
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
     * Overloaded verifyOTP with a custom max-verify-attempts limit.
     * Used for Default Admin OTP which has its own configurable lockout threshold.
     */
    @Transactional
    public boolean verifyOTP(String email, String code, int maxVerifyAttempts) {
        var otpOpt = otpRepository.findByEmail(email);
        if (otpOpt.isEmpty())
            return false;

        EmailVerificationOTP otpEntity = otpOpt.get();

        if (otpEntity.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpRepository.delete(otpEntity);
            return false;
        }

        if (!otpEntity.getOtpCode().equals(code)) {
            otpEntity.setAttemptsCount(otpEntity.getAttemptsCount() + 1);
            if (otpEntity.getAttemptsCount() >= maxVerifyAttempts) {
                otpRepository.delete(otpEntity);
            } else {
                otpRepository.save(otpEntity);
            }
            return false;
        }

        // For default admin, we don't flip user email verification status
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
