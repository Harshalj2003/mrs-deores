package com.mrsdeores.security;

/**
 * ThreadLocal context to distinguish between User and Admin authentication
 * attempts.
 */
public class AuthContext {
    private static final ThreadLocal<Boolean> adminAttempt = ThreadLocal.withInitial(() -> false);

    public static void setAdminAttempt(boolean isAdmin) {
        adminAttempt.set(isAdmin);
    }

    public static boolean isAdminAttempt() {
        return adminAttempt.get();
    }

    public static void clear() {
        adminAttempt.remove();
    }
}
