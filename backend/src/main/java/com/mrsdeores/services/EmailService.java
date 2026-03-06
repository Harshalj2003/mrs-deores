package com.mrsdeores.services;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
        private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

        @Autowired
        private JavaMailSender mailSender;

        @Value("${spring.mail.from}")
        private String senderEmail;

        @Value("${app.frontend.url}")
        private String frontendUrl;

        @Async
        public void sendOtpEmail(String toEmail, String username, String otp) {
                try {
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
                                                        ".footer { margin-top: 30px; font-size: 12px; color: #94a3b8; }"
                                                        +
                                                        "</style></head><body><div class='wrapper'><div class='container'>"
                                                        +
                                                        "<div class='header'>MRS. DEORE'S</div>" +
                                                        "<h3>Hello %s,</h3>" +
                                                        "<p>To complete your registration and unlock full access to our premium premixes, please use the 4-digit code below. This code is valid for <strong>15 minutes</strong>.</p>"
                                                        +
                                                        "<div class='otp-box'>%s</div>" +
                                                        "<p style='font-size: 14px; color: #64748b;'>If you didn't create an account with us, you can safely ignore this email.</p>"
                                                        +
                                                        "<div class='footer'>&copy; 2026 Mrs. Deore's Premix Team<br/>Nashik, Maharashtra</div>"
                                                        +
                                                        "</div></div></body></html>",
                                        username, otp);

                        helper.setText(htmlContent, true);
                        mailSender.send(message);
                        logger.info("Verification OTP sent asynchronously to {}", toEmail);
                } catch (Exception e) {
                        logger.error("Failed to send async verification email to {}: {}", toEmail, e.getMessage());
                }
        }

        @Async
        public void sendHtmlResetEmail(String toEmail, String username, String token, boolean isAdmin) {
                String resetLink = frontendUrl + "/reset-password?token=" + token;
                try {
                        MimeMessage message = mailSender.createMimeMessage();
                        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                        helper.setFrom(senderEmail);
                        helper.setTo(toEmail);

                        String subject = isAdmin ? "[Admin] Reset your Mrs. Deore's password"
                                        : "Reset your Mrs. Deore's password";
                        helper.setSubject(subject);

                        String buttonLabel = isAdmin ? "Secure Admin Reset" : "Secure Reset";

                        String htmlContent = String.format(
                                        "<!DOCTYPE html>" +
                                                        "<html><head><style>" +
                                                        "body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb; }"
                                                        +
                                                        ".wrapper { background-color: #f9fafb; padding: 40px 20px; }" +
                                                        ".container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: 1px solid #f1f5f9; }"
                                                        +
                                                        ".header { background: linear-gradient(135deg, #f97316 0%%, #ea580c 100%%); padding: 40px 20px; text-align: center; color: #ffffff; }"
                                                        +
                                                        ".header h1 { margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; }"
                                                        +
                                                        ".body { padding: 40px; }" +
                                                        ".welcome { font-size: 18px; font-weight: 700; color: #111827; margin-top: 0; }"
                                                        +
                                                        ".button-container { text-align: center; margin: 35px 0; }" +
                                                        ".button { display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #f97316 0%%, #ea580c 100%%); "
                                                        +
                                                        "color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 6px -1px rgba(234, 88, 12, 0.3); transition: all 0.2s; }"
                                                        +
                                                        ".fallback { font-size: 13px; color: #6b7280; background-color: #f8fafc; padding: 15px; border-radius: 12px; border: 1px dashed #e2e8f0; word-break: break-all; }"
                                                        +
                                                        ".admin-alert { border-left: 4px solid #ef4444; background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 25px 0; }"
                                                        +
                                                        ".about-section { background-color: #fffaf0; padding: 25px; margin: 20px -40px -40px -40px; border-top: 1px solid #ffedd5; }"
                                                        +
                                                        ".about-title { font-weight: 800; color: #9a3412; font-size: 13px; text-transform: uppercase; margin-bottom: 8px; display: block; }"
                                                        +
                                                        ".about-text { font-size: 13px; color: #7c2d12; margin: 0; line-height: 1.5; }"
                                                        +
                                                        ".footer { padding: 40px 20px; text-align: center; font-size: 12px; color: #94a3b8; }"
                                                        +
                                                        "</style></head>" +
                                                        "<body><div class='wrapper'><div class='container'>" +
                                                        "<div class='header'><h1>Mrs. Deore's</h1></div>" +
                                                        "<div class='body'>" +
                                                        "<p class='welcome'>Hello %s,</p>" +
                                                        "<p>We received a secure request to reset your password. To proceed, please click the button below. This link remains active for <strong>15 minutes</strong> for your safety.</p>"
                                                        +
                                                        "<div class='button-container'><a href='%s' class='button'>%s</a></div>"
                                                        +
                                                        "%s" + // adminNote slot
                                                        "<p style='margin-bottom: 10px;'>If you're having trouble with the button, copy and paste this link into your browser:</p>"
                                                        +
                                                        "<div class='fallback'>%s</div>" +
                                                        "<p style='margin-top: 25px; font-size: 14px; color: #64748b;'>If you did not request this, you can safely disregard this message. Your password will remain unchanged.</p>"
                                                        +
                                                        "<div class='about-section'>" +
                                                        "<span class='about-title'>About Mrs. Deore's</span>" +
                                                        "<p class='about-text'>From humble beginnings to your kitchen, Mrs. Deore's is dedicated to simplifying quality baking. We provide premium, authentic premixes that bring professional results to every home baker, anywhere in India.</p>"
                                                        +
                                                        "</div>" +
                                                        "</div></div>" +
                                                        "<div class='footer'>" +
                                                        "&copy; 2026 Mrs. Deore's Premix Team<br/>Empowering bakers. Ensuring quality. <br/> "
                                                        +
                                                        "Nashik, Maharashtra, India" +
                                                        "</div></div></body></html>",
                                        username, resetLink, buttonLabel, (isAdmin
                                                        ? "<div class='admin-alert'><p style='color: #ef4444; font-size: 14px; margin: 0;'><strong>Security Isolation:</strong> This is an Administrative reset link. It works strictly for your authorized admin credentials.</p></div>"
                                                        : ""),
                                        resetLink);
                        helper.setText(htmlContent, true);
                        mailSender.send(message);
                        logger.info("Asynchronous reset email dispatched to {} (isAdmin={})", toEmail, isAdmin);
                } catch (Exception e) {
                        logger.error("Failed to send async reset email to {}: {}", toEmail, e.getMessage());
                        // Last resort simple mail
                        try {
                                SimpleMailMessage simpleMessage = new SimpleMailMessage();
                                simpleMessage.setFrom(senderEmail);
                                simpleMessage.setTo(toEmail);
                                simpleMessage.setSubject(
                                                isAdmin ? "[Admin] Reset your Mrs. Deore's password"
                                                                : "Reset your Mrs. Deore's password");
                                simpleMessage.setText("Hello " + username + ",\n\nReset link: " + resetLink);
                                mailSender.send(simpleMessage);
                        } catch (Exception ex) {
                                logger.error("Double failure in email sending for {}: {}", toEmail, ex.getMessage());
                        }
                }
        }

        /**
         * Send a branded OTP email for Default Admin claim/resign actions.
         * Uses the same branded "MRS. DEORE'S" centered look as the registration OTP
         * but adds caution & important note sections for admin awareness.
         *
         * @param otp The OTP code to display (passed directly, not read from DB)
         */
        @Async
        public void sendDefaultAdminOtpEmail(String toEmail, String username, String action, String otp) {
                try {
                        boolean isClaim = "claim".equalsIgnoreCase(action);
                        String subject = isClaim
                                        ? "[CRITICAL] Default Admin Claim \u2014 Mrs. Deore's"
                                        : "[CRITICAL] Default Admin Resignation \u2014 Mrs. Deore's";
                        String actionDescription = isClaim
                                        ? "You have requested to become the <strong>Default Administrator</strong> of Mrs. Deore's system. This grants you exclusive control over team invitations, admin deletion, and critical system management."
                                        : "You have requested to <strong>resign</strong> from the Default Administrator position. After resignation, the position will be open for another admin to claim.";
                        String cautionText = isClaim
                                        ? "Once claimed, you will be the ONLY admin with invite &amp; delete powers. Other admins will be locked out of the Invite Team area."
                                        : "After resigning, you will lose exclusive administrative powers. Any admin will be able to claim the position.";

                        MimeMessage message = mailSender.createMimeMessage();
                        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                        helper.setFrom(senderEmail);
                        helper.setTo(toEmail);
                        helper.setSubject(subject);

                        String htmlContent = String.format(
                                        "<!DOCTYPE html><html><head><style>" +
                                                        "body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb; }"
                                                        +
                                                        ".wrapper { background-color: #f9fafb; padding: 40px 20px; }" +
                                                        ".container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); text-align: center; border: 1px solid #f1f5f9; }"
                                                        +
                                                        ".header { color: #f97316; font-size: 24px; font-weight: 800; margin-bottom: 20px; text-transform: uppercase; }"
                                                        +
                                                        ".otp-box { font-size: 36px; font-weight: 900; color: #ea580c; background-color: #fff7ed; padding: 20px; border-radius: 16px; margin: 25px 0; letter-spacing: 12px; border: 2px dashed #ffedd5; }"
                                                        +
                                                        ".caution { background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 14px 16px; border-radius: 0 12px 12px 0; margin: 20px 0; text-align: left; }"
                                                        +
                                                        ".caution-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #DC2626; margin: 0 0 5px; }"
                                                        +
                                                        ".caution-text { font-size: 13px; color: #7F1D1D; margin: 0; line-height: 1.5; }"
                                                        +
                                                        ".note { background-color: #FFFBEB; border-left: 4px solid #F59E0B; padding: 14px 16px; border-radius: 0 12px 12px 0; margin: 20px 0; text-align: left; }"
                                                        +
                                                        ".note-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #B45309; margin: 0 0 5px; }"
                                                        +
                                                        ".note-text { font-size: 13px; color: #78350F; margin: 0; line-height: 1.5; }"
                                                        +
                                                        ".footer { margin-top: 30px; font-size: 12px; color: #94a3b8; }"
                                                        +
                                                        "</style></head><body><div class='wrapper'><div class='container'>"
                                                        +
                                                        "<div class='header'>MRS. DEORE'S</div>" +
                                                        "<h3>Hello @%s,</h3>" +
                                                        "<p style='font-size:14px;color:#4B5563;'>%s</p>" +
                                                        "<p style='font-size:13px;color:#6B7280;'>Use the 4-digit code below to confirm. This code is valid for <strong>15 minutes</strong>.</p>"
                                                        +
                                                        "<div class='otp-box'>%s</div>" +
                                                        "<div class='caution'>" +
                                                        "<p class='caution-title'>\u26A0 Caution</p>" +
                                                        "<p class='caution-text'>%s</p>" +
                                                        "</div>" +
                                                        "<div class='note'>" +
                                                        "<p class='note-title'>\uD83D\uDCCC Important Note</p>" +
                                                        "<p class='note-text'>This OTP is strictly for <strong>Default Admin verification</strong> only. It is NOT related to user registration or password reset. If you did not initiate this action, contact your system owner immediately and do NOT share this code.</p>"
                                                        +
                                                        "</div>" +
                                                        "<p style='font-size: 12px; color: #9CA3AF; margin-top: 25px;'>If you did not request this, you can safely ignore this email.</p>"
                                                        +
                                                        "<div class='footer'>&copy; 2026 Mrs. Deore's Premix Team<br/>Nashik, Maharashtra</div>"
                                                        +
                                                        "</div></div></body></html>",
                                        username, actionDescription, otp, cautionText);

                        helper.setText(htmlContent, true);
                        mailSender.send(message);
                        logger.info("Default Admin OTP email sent to {} for action: {}", toEmail, action);
                } catch (Exception e) {
                        logger.error("Failed to send default admin OTP email to {}: {}", toEmail, e.getMessage());
                }
        }
}
