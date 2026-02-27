package com.mrsdeores.services;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * In-memory real-time session tracker.
 * Users send heartbeats every ~30s. Sessions are evicted after 5 min of
 * inactivity.
 * No database writes per heartbeat — fast and lightweight.
 */
@Service
public class ActiveSessionService {

    /** Session metadata for a single user. */
    public static class SessionInfo {
        private final Long userId;
        private final Instant sessionStart;
        private volatile Instant lastSeen;

        public SessionInfo(Long userId) {
            this.userId = userId;
            this.sessionStart = Instant.now();
            this.lastSeen = Instant.now();
        }

        public Long getUserId() {
            return userId;
        }

        public Instant getSessionStart() {
            return sessionStart;
        }

        public Instant getLastSeen() {
            return lastSeen;
        }

        public void touch() {
            this.lastSeen = Instant.now();
        }

        public long getDurationSeconds() {
            return Duration.between(sessionStart, lastSeen).getSeconds();
        }
    }

    /** Live sessions keyed by userId. */
    private final ConcurrentHashMap<Long, SessionInfo> sessions = new ConcurrentHashMap<>();

    /**
     * Inactivity threshold — session is "dead" after this (no heartbeat received).
     */
    private static final Duration EVICTION_THRESHOLD = Duration.ofMinutes(5);

    /**
     * Record a heartbeat from a user. Creates a new session or updates the existing
     * one.
     */
    public void heartbeat(Long userId) {
        sessions.compute(userId, (id, existing) -> {
            if (existing != null) {
                existing.touch();
                return existing;
            }
            return new SessionInfo(userId);
        });
    }

    /**
     * Get all sessions active within a given time window.
     * E.g., window=10m returns sessions where lastSeen > (now - 10 minutes).
     */
    public List<SessionInfo> getActiveSessions(Duration window) {
        Instant cutoff = Instant.now().minus(window);
        return sessions.values().stream()
                .filter(s -> s.getLastSeen().isAfter(cutoff))
                .sorted((a, b) -> b.getLastSeen().compareTo(a.getLastSeen()))
                .collect(Collectors.toList());
    }

    /**
     * Count of currently live sessions (within eviction threshold).
     */
    public long getLiveCount() {
        Instant cutoff = Instant.now().minus(EVICTION_THRESHOLD);
        return sessions.values().stream()
                .filter(s -> s.getLastSeen().isAfter(cutoff))
                .count();
    }

    /**
     * Evict stale sessions every 2 minutes. Keeps memory clean.
     */
    @Scheduled(fixedRate = 120_000)
    public void evictStaleSessions() {
        Instant cutoff = Instant.now().minus(EVICTION_THRESHOLD);
        sessions.entrySet().removeIf(e -> e.getValue().getLastSeen().isBefore(cutoff));
    }
}
