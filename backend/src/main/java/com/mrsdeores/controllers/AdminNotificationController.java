package com.mrsdeores.controllers;

import com.mrsdeores.models.Notification;
import com.mrsdeores.models.User;
import com.mrsdeores.repository.NotificationRepository;
import com.mrsdeores.repository.UserRepository;
import com.mrsdeores.repository.AdminInvitationRepository;
import com.mrsdeores.repository.AdminNotificationReadRepository;
import com.mrsdeores.models.AdminNotificationRead;
import com.mrsdeores.models.AdminInvitation;
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
import com.mrsdeores.services.RealTimeUpdateService;

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

    @Autowired
    private AdminInvitationRepository adminInvitationRepository;

    @Autowired
    private AdminNotificationReadRepository adminNotificationReadRepository;

    @Autowired
    private RealTimeUpdateService realTimeUpdateService;

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
            if (!n.isGlobal() && n.getTargetAdminUsername() != null) {
                dto.put("targetAdminUsername", n.getTargetAdminUsername());
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
        String targetIdentifier = payload.get("targetUserId"); // Now expects Email or Username, not ID
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

        if (targetIdentifier != null && !targetIdentifier.trim().isEmpty()) {
            User targetUser = userRepository.findByUsernameOrEmail(targetIdentifier, targetIdentifier).orElse(null);
            if (targetUser != null) {
                notification.setTargetUser(targetUser);
            } else {
                AdminInvitation targetAdmin = adminInvitationRepository
                        .findByUsernameOrEmail(targetIdentifier, targetIdentifier).orElse(null);
                if (targetAdmin != null) {
                    notification.setTargetAdminUsername(targetAdmin.getUsername());
                } else {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Target user or admin not found with provided username/email"));
                }
            }
        }

        Notification saved = notificationRepository.save(notification);

        // Broadcast the new notification as a safe DTO to prevent
        // LazyInitializationException
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", saved.getId());
        dto.put("title", saved.getTitle());
        dto.put("message", saved.getMessage());
        dto.put("type", saved.getType());
        dto.put("createdAt", saved.getCreatedAt() != null ? saved.getCreatedAt().toString() : null);
        dto.put("isGlobal", saved.isGlobal());

        if (!saved.isGlobal() && saved.getTargetUser() != null) {
            dto.put("targetUserEmail", saved.getTargetUser().getEmail());
            dto.put("targetUsername", saved.getTargetUser().getUsername());
            dto.put("targetUserId", saved.getTargetUser().getId());
        }
        if (!saved.isGlobal() && saved.getTargetAdminUsername() != null) {
            dto.put("targetAdminUsername", saved.getTargetAdminUsername());
        }
        if (saved.getSender() != null) {
            dto.put("senderUsername", saved.getSender().getUsername());
            dto.put("senderEmail", saved.getSender().getEmail());
        }
        dto.put("isRead", false); // Important for React state

        realTimeUpdateService.broadcast("NEW_NOTIFICATION", dto);

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
            dto.put("type", "USER");
            userRepository.findById(r.getId().getUserId()).ifPresent(u -> {
                dto.put("username", u.getUsername());
                dto.put("email", u.getEmail());
                dto.put("phone", u.getPhone());
            });
            return dto;
        }).collect(Collectors.toList());

        List<AdminNotificationRead> adminReads = adminNotificationReadRepository.findByIdNotificationId(id);
        List<Map<String, Object>> adminReadList = adminReads.stream().map(r -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("adminUsername", r.getId().getAdminUsername());
            dto.put("readAt", r.getReadAt() != null ? r.getReadAt().toString() : null);
            dto.put("type", "ADMIN");
            adminInvitationRepository.findByUsername(r.getId().getAdminUsername()).ifPresent(a -> {
                dto.put("username", a.getUsername());
                dto.put("email", a.getEmail());
                dto.put("phone", a.getPhone());
            });
            return dto;
        }).collect(Collectors.toList());

        readList.addAll(adminReadList);
        // Sort combined list by readAt descending
        readList.sort((a, b) -> {
            String dateA = (String) a.get("readAt");
            String dateB = (String) b.get("readAt");
            if (dateA == null)
                return 1;
            if (dateB == null)
                return -1;
            return dateB.compareTo(dateA);
        });

        return ResponseEntity.ok(readList);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> rollbackNotification(@PathVariable Long id) {
        if (!notificationRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        // This globally deletes the notification from all users' inboxes (Rollback)
        notificationRepository.deleteById(id);

        // Broadcast deletion event to clients
        realTimeUpdateService.broadcast("NOTIFICATION_DELETED", Map.of("id", id));

        return ResponseEntity.ok(Map.of("message", "Notification rolled back and deleted globally"));
    }
}
