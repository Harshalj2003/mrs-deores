package com.mrsdeores.services;

import com.mrsdeores.models.EmailVerificationOTP;
import com.mrsdeores.repository.EmailVerificationOTPRepository;
import com.mrsdeores.repository.UserRepository;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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
    private JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String senderEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    /**
     * Generates a 4-digit OTP and sends it to the user's email.
     */
    @Transactional
    public void sendVerificationOTP(String email, String username) {
        String otp = String.format("%04d", new Random().nextInt(10000));

        // Save or update existing OTP
        otpRepository.deleteByEmail(email);
        otpRepository.flush();

        EmailVerificationOTP otpEntity = new EmailVerificationOTP(email, otp, 15); // 15 mins expiry
        otpRepository.save(otpEntity);

        try {
            sendOtpEmail(email, username, otp);
            logger.info("Verification OTP sent to {}", email);
        } catch (Exception e) {
            logger.error("Failed to send verification email to {}: {}", email, e.getMessage());
            throw new RuntimeException("Failed to send verification email. Please try again later.");
        }
    }

    private void sendOtpEmail(String toEmail, String username, String otp) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(senderEmail);
        helper.setTo(toEmail);
        helper.setSubject("Verify your Mrs. Deore's account");

        String htmlContent = String.format(
                "<!DOCTYPE html><html><head><style>" +
                        "body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb; }"
                        +
                        ".wrapper { background-color: #f9fafb; padding: 40px 20px; }" +
                        ".container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); text-align: center; border: 1px solid #f1f5f9; }"
                        +
                        ".header { color: #f97316; font-size: 24px; font-weight: 800; margin-bottom: 20px; text-transform: uppercase; }"
                        +
                        ".otp-box { font-size: 36px; font-weight: 900; color: #ea580c; background-color: #fff7ed; padding: 20px; border-radius: 16px; margin: 30px 0; letter-spacing: 12px; border: 2px dashed #ffedd5; }"
                        +
                        ".footer { margin-top: 30px; font-size: 12px; color: #94a3b8; }" +
                        "</style></head><body><div class='wrapper'><div class='container'>" +
                        "<div class='header'>MRS. DEORE'S</div>" +
                        "<h3>Hello %s,</h3>" +
                        "<p>To complete your registration and unlock full access to our premium premixes, please use the 4-digit code below. This code is valid for <strong>15 minutes</strong>.</p>"
                        +
                        "<div class='otp-box'>%s</div>" +
                        "<p style='font-size: 14px; color: #64748b;'>If you didn't create an account with us, you can safely ignore this email.</p>"
                        +
                        "<div class='footer'>&copy; 2026 Mrs. Deore's Premix Team<br/>Nashik, Maharashtra</div>" +
                        "</div></div></body></html>",
                username, otp);

        helper.setText(htmlContent, true);
        mailSender.send(message);
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
