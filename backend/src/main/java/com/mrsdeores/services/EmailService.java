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

        /**
         * Send a branded invitation email to a newly invited admin team member.
         * Uses 100% inline styles (Gmail strips style blocks).
         * Matches the centered card + dashed box + colored alert styling of the OTP
         * email.
         */
        @Async
        public void sendAdminInvitationEmail(String toEmail, String inviterName, String token, int expiryHours) {
                String enrollLink = frontendUrl + "/login?enroll=true&token=" + token;
                try {
                        MimeMessage message = mailSender.createMimeMessage();
                        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                        helper.setFrom(senderEmail);
                        helper.setTo(toEmail);
                        helper.setSubject("You're Invited to Join the Mrs. Deore's Admin Team! \uD83C\uDF89");

                        String html = "<!DOCTYPE html><html><head><meta charset='UTF-8'></head>"
                                        + "<body style='font-family:Inter,Arial,sans-serif;line-height:1.6;color:#1f2937;margin:0;padding:0;background-color:#f9fafb;'>"
                                        + "<div style='background-color:#f9fafb;padding:40px 20px;'>"
                                        + "<div style='max-width:500px;margin:0 auto;background-color:#ffffff;border-radius:24px;padding:40px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);text-align:center;border:1px solid #f1f5f9;'>"
                                        // ── Brand Header ──
                                        + "<div style='color:#f97316;font-size:24px;font-weight:800;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.1em;'>MRS. DEORE'S</div>"
                                        + "<div style='font-size:12px;color:#9CA3AF;font-weight:600;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:25px;'>Admin Team Invitation</div>"
                                        // ── Welcome ──
                                        + "<h3 style='font-size:16px;font-weight:700;color:#111827;margin:0 0 15px;'>Hello,</h3>"
                                        + "<p style='font-size:14px;color:#4B5563;margin:0 0 25px;'>You have been personally invited by <strong style='color:#ea580c;'>@"
                                        + inviterName
                                        + "</strong> to join the <strong>Mrs. Deore's Admin Team</strong>. "
                                        + "As an admin, you will have the authority to manage products, categories, orders, and more through the Admin Portal.</p>"
                                        // ── Token Label ──
                                        + "<p style='font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.15em;color:#92400e;margin:0 0 10px;'>Your Exclusive Invitation Token</p>"
                                        // ── Token Box & Copy Button ──
                                        + "<div style='font-size:12px;font-weight:700;color:#9a3412;background-color:#fff7ed;padding:18px;border-radius:16px;margin:0 0 15px;border:2px dashed #ffedd5;word-break:break-all;font-family:Courier New,monospace;letter-spacing:1px;'>"
                                        + token + "</div>"
                                        + "<div style='margin:0 0 25px;text-align:center;'>"
                                        + "<a href='" + frontendUrl + "/copy-token?token=" + token
                                        + "' style='display:inline-block;padding:10px 24px;background-color:#fff;border:1px solid #fed7aa;color:#ea580c;text-decoration:none;border-radius:10px;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;'>\uD83D\uDCCB Copy Token</a>"
                                        + "</div>"
                                        // ── How to Enroll (table-based for Gmail compatibility) ──
                                        + "<p style='font-size:13px;font-weight:700;color:#111827;margin:0 0 12px;text-align:left;'>How to Enroll:</p>"
                                        + "<table cellpadding='0' cellspacing='0' border='0' style='margin:0 0 25px;width:100%;'>"
                                        + "<tr><td style='vertical-align:top;padding:0 10px 8px 0;width:28px;'>"
                                        + "<div style='width:22px;height:22px;border-radius:50%;background-color:#f97316;color:#ffffff;font-size:11px;font-weight:800;text-align:center;line-height:22px;'>1</div>"
                                        + "</td><td style='font-size:12px;color:#374151;vertical-align:top;padding-top:2px;text-align:left;'>Click the enrollment button below or paste the token on the login page.</td></tr>"
                                        + "<tr><td style='vertical-align:top;padding:0 10px 8px 0;width:28px;'>"
                                        + "<div style='width:22px;height:22px;border-radius:50%;background-color:#f97316;color:#ffffff;font-size:11px;font-weight:800;text-align:center;line-height:22px;'>2</div>"
                                        + "</td><td style='font-size:12px;color:#374151;vertical-align:top;padding-top:2px;text-align:left;'>Enter the pre-approved email, phone, a username, and a strong password.</td></tr>"
                                        + "<tr><td style='vertical-align:top;padding:0 10px 8px 0;width:28px;'>"
                                        + "<div style='width:22px;height:22px;border-radius:50%;background-color:#f97316;color:#ffffff;font-size:11px;font-weight:800;text-align:center;line-height:22px;'>3</div>"
                                        + "</td><td style='font-size:12px;color:#374151;vertical-align:top;padding-top:2px;text-align:left;'>Complete your profile setup and you're in!</td></tr>"
                                        + "</table>"
                                        // ── Enrollment Button ──
                                        + "<div style='text-align:center;margin:0 0 30px;'>"
                                        + "<a href='" + enrollLink
                                        + "' style='display:inline-block;padding:14px 32px;background-color:#ea580c;color:#ffffff;text-decoration:none;border-radius:12px;font-weight:800;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;'>"
                                        + "\uD83D\uDD11 Enroll as Admin</a></div>"
                                        // ── Caution: One-Time Use (red) ──
                                        + "<div style='background-color:#FEF2F2;border-left:4px solid #EF4444;padding:14px 16px;border-radius:0 12px 12px 0;margin:0 0 15px;text-align:left;'>"
                                        + "<p style='font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:#DC2626;margin:0 0 5px;'>\u26A0 One-Time Use Token</p>"
                                        + "<p style='font-size:12px;color:#7F1D1D;margin:0;line-height:1.5;'>This invitation token can only be used <strong>once</strong>. After enrollment, it will be permanently invalidated. "
                                        + "If the token has already been used or expired, request a new invitation from the Default Admin.</p></div>"
                                        // ── Note: Expiry (amber) ──
                                        + "<div style='background-color:#FFFBEB;border-left:4px solid #F59E0B;padding:14px 16px;border-radius:0 12px 12px 0;margin:0 0 15px;text-align:left;'>"
                                        + "<p style='font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:#B45309;margin:0 0 5px;'>\uD83D\uDCCC Token Expiry</p>"
                                        + "<p style='font-size:12px;color:#78350F;margin:0;line-height:1.5;'>This token is valid for <strong>"
                                        + expiryHours
                                        + " hours</strong> from generation. After that, it expires and cannot be used. Complete your enrollment before the deadline.</p></div>"
                                        // ── Info: Security (blue) ──
                                        + "<div style='background-color:#EFF6FF;border-left:4px solid #3B82F6;padding:14px 16px;border-radius:0 12px 12px 0;margin:0 0 20px;text-align:left;'>"
                                        + "<p style='font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:#1D4ED8;margin:0 0 5px;'>\uD83D\uDD12 Security Notice</p>"
                                        + "<p style='font-size:12px;color:#1E3A5F;margin:0;line-height:1.5;'>Do <strong>NOT</strong> share this token or email with anyone. "
                                        + "This invitation is linked exclusively to your email address (<strong>"
                                        + toEmail
                                        + "</strong>). If you suspect unauthorized access, contact the admin team immediately.</p></div>"
                                        // ── Ignore ──
                                        + "<p style='font-size:12px;color:#9CA3AF;margin:0;'>If you did not expect this invitation, you can safely ignore this email.</p>"
                                        + "</div>"
                                        // ── Footer ──
                                        + "<div style='padding:25px 20px;text-align:center;font-size:12px;color:#94a3b8;'>"
                                        + "&copy; 2026 Mrs. Deore's Premix Team<br/>Nashik, Maharashtra</div>"
                                        + "</div></body></html>";

                        helper.setText(html, true);
                        mailSender.send(message);
                        logger.info("Admin invitation email sent to {} (invited by @{})", toEmail, inviterName);
                } catch (Exception e) {
                        logger.error("Failed to send admin invitation email to {}: {}", toEmail, e.getMessage());
                }
        }
}
