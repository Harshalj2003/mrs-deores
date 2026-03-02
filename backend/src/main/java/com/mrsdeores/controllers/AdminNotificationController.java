package com.mrsdeores.controllers;

import com.mrsdeores.models.Notification;
import com.mrsdeores.models.User;
import com.mrsdeores.repository.NotificationRepository;
import com.mrsdeores.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.mrsdeores.repository.NotificationReadRepository;
import com.mrsdeores.models.NotificationRead;

@RestController
@RequestMapping("/api/admin/notifications")
@PreAuthorize("hasRole('ADMIN')")
public class AdminNotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationReadRepository notificationReadRepository;

    @GetMapping
    public ResponseEntity<?> getAllSentNotifications(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notificationPage = notificationRepository.findAllByOrderByCreatedAtDesc(pageable);

        List<Map<String, Object>> list = notificationPage.getContent().stream().map(n -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", n.getId());
            dto.put("title", n.getTitle());
            dto.put("message", n.getMessage());
            dto.put("type", n.getType());
            dto.put("createdAt", n.getCreatedAt() != null ? n.getCreatedAt().toString() : null);
            dto.put("isGlobal", n.isGlobal());
            if (!n.isGlobal() && n.getTargetUser() != null) {
                dto.put("targetUserEmail", n.getTargetUser().getEmail());
                dto.put("targetUsername", n.getTargetUser().getUsername());
            }
            if (n.getSender() != null) {
                dto.put("senderUsername", n.getSender().getUsername());
                dto.put("senderEmail", n.getSender().getEmail());
            }
            return dto;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("notifications", list);
        response.put("totalItems", notificationPage.getTotalElements());
        response.put("totalPages", notificationPage.getTotalPages());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> sendNotification(@RequestBody Map<String, String> payload) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User sender = null;
        if (auth != null && auth.getName() != null) {
            sender = userRepository.findByEmail(auth.getName()).orElse(null);
        }

        String title = payload.get("title");
        String message = payload.get("message");
        String type = payload.getOrDefault("type", "INFO");
        String targetUserIdStr = payload.get("targetUserId"); // If null/empty -> Global Broadcast
        String attachmentUrl = payload.get("attachmentUrl");
        String attachmentType = payload.get("attachmentType");

        if (title == null || title.isBlank() || message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Title and Message are required"));
        }

        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setSender(sender);
        notification.setAttachmentUrl(attachmentUrl);
        notification.setAttachmentType(attachmentType);

        if (targetUserIdStr != null && !targetUserIdStr.trim().isEmpty()) {
            try {
                Long targetUserId = Long.parseLong(targetUserIdStr);
                User user = userRepository.findById(targetUserId)
                        .orElseThrow(() -> new RuntimeException("Target user not found"));
                notification.setTargetUser(user);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid Target User ID"));
            }
        }

        Notification saved = notificationRepository.save(notification);
        return ResponseEntity.ok(Map.of("message", "Notification sent successfully", "id", saved.getId()));
    }

    @GetMapping("/{id}/reads")
    public ResponseEntity<?> getNotificationReads(@PathVariable Long id) {
        if (!notificationRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        List<NotificationRead> reads = notificationReadRepository.findByIdNotificationId(id);
        List<Map<String, Object>> readList = reads.stream().map(r -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("userId", r.getId().getUserId());
            dto.put("readAt", r.getReadAt() != null ? r.getReadAt().toString() : null);
            userRepository.findById(r.getId().getUserId()).ifPresent(u -> {
                dto.put("username", u.getUsername());
                dto.put("email", u.getEmail());
                dto.put("phone", u.getPhone());
            });
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(readList);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> rollbackNotification(@PathVariable Long id) {
        if (!notificationRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        // This globally deletes the notification from all users' inboxes (Rollback)
        notificationRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Notification rolled back and deleted globally"));
    }
}
