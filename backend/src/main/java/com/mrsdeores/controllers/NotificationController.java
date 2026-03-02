package com.mrsdeores.controllers;

import com.mrsdeores.models.Notification;
import com.mrsdeores.models.NotificationRead;
import com.mrsdeores.models.User;
import com.mrsdeores.repository.NotificationReadRepository;
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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationReadRepository notificationReadRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminInvitationRepository adminInvitationRepository;

    @Autowired
    private AdminNotificationReadRepository adminNotificationReadRepository;

    @GetMapping
    public ResponseEntity<?> getMyNotifications(Authentication authentication,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        String currentUsername = authentication.getName();
        User user = userRepository.findByUsername(currentUsername).orElse(null);
        AdminInvitation admin = null;
        if (user == null) {
            admin = adminInvitationRepository.findByUsername(currentUsername).orElse(null);
            if (admin == null) {
                return ResponseEntity.status(401).body(Map.of("message", "User not found"));
            }
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notificationsPage;
        List<Long> readIds;

        if (user != null) {
            notificationsPage = notificationRepository.findRelevantUserNotifications(user.getId(), pageable);
            List<NotificationRead> userReads = notificationReadRepository.findByIdUserId(user.getId());
            readIds = userReads.stream().map(r -> r.getId().getNotificationId()).collect(Collectors.toList());
        } else if (admin != null) {
            notificationsPage = notificationRepository.findRelevantAdminNotifications(admin.getUsername(), pageable);
            List<AdminNotificationRead> adminReads = adminNotificationReadRepository
                    .findByIdAdminUsername(admin.getUsername());
            readIds = adminReads.stream().map(r -> r.getId().getNotificationId()).collect(Collectors.toList());
        } else {
            return ResponseEntity.status(401).body(Map.of("message", "User not found"));
        }

        List<Map<String, Object>> responseList = notificationsPage.getContent().stream().map(n -> {
            boolean isRead = readIds.contains(n.getId());
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", n.getId());
            dto.put("title", n.getTitle());
            dto.put("message", n.getMessage());
            dto.put("type", n.getType());
            dto.put("createdAt", n.getCreatedAt() != null ? n.getCreatedAt().toString() : null);
            dto.put("isGlobal", n.isGlobal());
            dto.put("isRead", isRead);
            if (n.getSender() != null) {
                dto.put("senderUsername", n.getSender().getUsername());
                dto.put("senderEmail", n.getSender().getEmail());
            }
            if (n.getAttachmentUrl() != null && !n.getAttachmentUrl().isEmpty()) {
                dto.put("attachmentUrl", n.getAttachmentUrl());
                dto.put("attachmentType", n.getAttachmentType());
            }
            return dto;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("notifications", responseList);
        response.put("currentPage", notificationsPage.getNumber());
        response.put("totalItems", notificationsPage.getTotalElements());
        response.put("totalPages", notificationsPage.getTotalPages());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Authentication authentication) {
        String currentUsername = authentication.getName();
        User user = userRepository.findByUsername(currentUsername).orElse(null);
        AdminInvitation admin = null;

        if (user == null) {
            admin = adminInvitationRepository.findByUsername(currentUsername).orElse(null);
            if (admin == null) {
                return ResponseEntity.status(401).body(Map.of("message", "User not found"));
            }
        }

        if (user != null) {
            if (!notificationReadRepository.existsByIdUserIdAndIdNotificationId(user.getId(), id)) {
                NotificationRead.NotificationReadId readIdObj = new NotificationRead.NotificationReadId(user.getId(),
                        id);
                NotificationRead readRecord = new NotificationRead();
                readRecord.setId(readIdObj);
                notificationReadRepository.save(readRecord);
            }
        } else if (admin != null) {
            if (!adminNotificationReadRepository.existsByIdAdminUsernameAndIdNotificationId(admin.getUsername(), id)) {
                AdminNotificationRead.AdminNotificationReadId readIdObj = new AdminNotificationRead.AdminNotificationReadId(
                        admin.getUsername(), id);
                AdminNotificationRead readRecord = new AdminNotificationRead();
                readRecord.setId(readIdObj);
                adminNotificationReadRepository.save(readRecord);
            }
        }

        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMyNotification(@PathVariable Long id, Authentication authentication) {
        String currentUsername = authentication.getName();
        User user = userRepository.findByUsername(currentUsername).orElse(null);
        AdminInvitation admin = null;

        if (user == null) {
            admin = adminInvitationRepository.findByUsername(currentUsername).orElse(null);
            if (admin == null) {
                return ResponseEntity.status(401).body(Map.of("message", "User not found"));
            }
        }

        if (user != null) {
            NotificationRead.NotificationReadId readIdObj = new NotificationRead.NotificationReadId(user.getId(), id);
            NotificationRead readRecord = notificationReadRepository.findById(readIdObj).orElseGet(() -> {
                NotificationRead nr = new NotificationRead();
                nr.setId(readIdObj);
                return nr;
            });
            readRecord.setDeleted(true);
            notificationReadRepository.save(readRecord);
        } else {
            AdminNotificationRead.AdminNotificationReadId readIdObj = new AdminNotificationRead.AdminNotificationReadId(
                    admin.getUsername(), id);
            AdminNotificationRead readRecord = adminNotificationReadRepository.findById(readIdObj).orElseGet(() -> {
                AdminNotificationRead anr = new AdminNotificationRead();
                anr.setId(readIdObj);
                return anr;
            });
            readRecord.setDeleted(true);
            adminNotificationReadRepository.save(readRecord);
        }

        return ResponseEntity.ok(Map.of("message", "Notification deleted"));
    }
}
