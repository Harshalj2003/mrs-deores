package com.mrsdeores.controllers;

import com.mrsdeores.security.services.UserDetailsImpl;
import com.mrsdeores.services.ActiveSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Lightweight heartbeat endpoint for real-time active user tracking.
 * Called by the frontend every 30s for logged-in users.
 */
@RestController
@RequestMapping("/api/activity")
public class ActivityController {

    @Autowired
    private ActiveSessionService activeSessionService;

    /**
     * Record a heartbeat from the currently authenticated user.
     * This is intentionally minimal — no request body, no DB write.
     */
    @PostMapping("/heartbeat")
    public ResponseEntity<Void> heartbeat(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails != null) {
            activeSessionService.heartbeat(userDetails.getId());
        }
        return ResponseEntity.ok().build();
    }
}
