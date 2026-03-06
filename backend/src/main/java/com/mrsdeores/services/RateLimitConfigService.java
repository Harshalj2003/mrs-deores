package com.mrsdeores.services;

import com.mrsdeores.repository.SiteSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Centralized service for reading rate limit configurations from site_settings.
 * All rate limit values are admin-configurable via the Settings panel.
 * Falls back to sensible defaults if no setting exists in the database.
 */
@Service
public class RateLimitConfigService {

    @Autowired
    private SiteSettingsRepository settingsRepository;

    // ── Default values (used when no setting exists in DB) ──

    private static final int DEFAULT_FORGOT_PASSWORD_COOLDOWN_MINUTES = 5;
    private static final int DEFAULT_OTP_MAX_RESENDS = 3;
    private static final int DEFAULT_OTP_WINDOW_MINUTES = 15;
    private static final int DEFAULT_OTP_MAX_VERIFY_ATTEMPTS = 5;
    private static final int DEFAULT_ADMIN_REG_MAX_ATTEMPTS = 3;
    private static final int DEFAULT_ADMIN_REG_WINDOW_MINUTES = 15;

    private static final int DEFAULT_DEFAULT_ADMIN_OTP_MAX_RESENDS = 3;
    private static final int DEFAULT_DEFAULT_ADMIN_OTP_WINDOW_MINUTES = 15;
    private static final int DEFAULT_DEFAULT_ADMIN_OTP_MAX_VERIFY_ATTEMPTS = 5;

    // ── Public accessors ──

    /** Minutes a user must wait between forgot-password requests */
    public int getForgotPasswordCooldownMinutes() {
        return getInt("rate_limit_forgot_password_minutes", DEFAULT_FORGOT_PASSWORD_COOLDOWN_MINUTES);
    }

    /** Max OTP resend attempts within the window */
    public int getOtpMaxResends() {
        return getInt("rate_limit_otp_max_resends", DEFAULT_OTP_MAX_RESENDS);
    }

    /** OTP rate limit window in minutes */
    public int getOtpWindowMinutes() {
        return getInt("rate_limit_otp_window_minutes", DEFAULT_OTP_WINDOW_MINUTES);
    }

    /** Max wrong OTP verification attempts before lockout */
    public int getOtpMaxVerifyAttempts() {
        return getInt("rate_limit_otp_max_verify_attempts", DEFAULT_OTP_MAX_VERIFY_ATTEMPTS);
    }

    /** Max admin registration attempts per IP within the window */
    public int getAdminRegMaxAttempts() {
        return getInt("rate_limit_admin_reg_max_attempts", DEFAULT_ADMIN_REG_MAX_ATTEMPTS);
    }

    /** Admin registration rate limit window in minutes */
    public int getAdminRegWindowMinutes() {
        return getInt("rate_limit_admin_reg_window_minutes", DEFAULT_ADMIN_REG_WINDOW_MINUTES);
    }

    /** Max OTP resend attempts for default admin claim/resign within the window */
    public int getDefaultAdminOtpMaxResends() {
        return getInt("rate_limit_default_admin_otp_max_resends", DEFAULT_DEFAULT_ADMIN_OTP_MAX_RESENDS);
    }

    /** Default admin OTP rate limit window in minutes */
    public int getDefaultAdminOtpWindowMinutes() {
        return getInt("rate_limit_default_admin_otp_window_minutes", DEFAULT_DEFAULT_ADMIN_OTP_WINDOW_MINUTES);
    }

    /** Max wrong OTP verification attempts for default admin before lockout */
    public int getDefaultAdminOtpMaxVerifyAttempts() {
        return getInt("rate_limit_default_admin_otp_max_verify_attempts",
                DEFAULT_DEFAULT_ADMIN_OTP_MAX_VERIFY_ATTEMPTS);
    }

    // ── Internal helper ──

    private int getInt(String key, int defaultValue) {
        return settingsRepository.findBySettingKey(key)
                .map(s -> {
                    try {
                        int val = Integer.parseInt(s.getSettingValue());
                        return val > 0 ? val : defaultValue;
                    } catch (NumberFormatException e) {
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }
}
