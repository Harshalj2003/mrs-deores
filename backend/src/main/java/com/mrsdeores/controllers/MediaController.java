package com.mrsdeores.controllers;

import com.mrsdeores.services.CloudinaryService;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Handles media upload signature generation.
 * Frontend uses the returned signed params to upload DIRECTLY to Cloudinary.
 * Backend NEVER proxies file streams.
 */
@RestController
@RequestMapping("/api/media")
public class MediaController {

    private static final Logger logger = LoggerFactory.getLogger(MediaController.class);

    private final CloudinaryService cloudinaryService;

    // Per-user rate limiting: 30 signatures per minute
    private final ConcurrentHashMap<String, Bucket> rateLimitBuckets = new ConcurrentHashMap<>();

    public MediaController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    /**
     * POST /api/media/signature
     * Generates a signed Cloudinary upload payload.
     * - Admin only
     * - Rate limited to 30 req/min per user
     * - Returns signed params; NO file bytes
     */
    @PostMapping("/signature")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUploadSignature(
            @RequestBody Map<String, Object> body,
            Authentication authentication) {

        // Rate limit per admin user
        String username = authentication.getName();
        Bucket bucket = rateLimitBuckets.computeIfAbsent(username, k -> Bucket.builder()
                .addLimit(Bandwidth.classic(30, Refill.greedy(30, Duration.ofMinutes(1))))
                .build());

        if (!bucket.tryConsume(1)) {
            logger.warn("Rate limit exceeded for user={} on /api/media/signature", username);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", "Too many signature requests. Please wait a moment."));
        }

        String mediaType = (String) body.getOrDefault("mediaType", "PRODUCT");
        Long entityId = body.get("entityId") != null
                ? Long.valueOf(body.get("entityId").toString())
                : null;

        logger.info("Generating signature for user={} mediaType={} entityId={}", username, mediaType, entityId);

        try {
            Map<String, Object> signaturePayload = cloudinaryService.generateUploadSignature(mediaType, entityId);
            return ResponseEntity.ok(signaturePayload);
        } catch (Exception e) {
            logger.error("Signature generation error for user={}", username, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Could not generate upload signature. Try again."));
        }
    }
}
