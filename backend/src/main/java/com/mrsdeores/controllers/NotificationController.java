package com.mrsdeores.controllers;

import com.mrsdeores.models.Notification;
import com.mrsdeores.models.NotificationRead;
import com.mrsdeores.models.User;
import com.mrsdeores.repository.NotificationReadRepository;
import com.mrsdeores.repository.NotificationRepository;
import com.mrsdeores.repository.UserRepository;
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

    @GetMapping
    public ResponseEntity<?> getMyNotifications(Authentication authentication,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        String currentUsername = authentication.getName();
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notificationsPage = notificationRepository.findRelevantNotifications(user.getId(), pageable);

        // Fetch all read records for this user to calculate accurate unread state
        List<NotificationRead> userReads = notificationReadRepository.findByIdUserId(user.getId());
        List<Long> readIds = userReads.stream().map(r -> r.getId().getNotificationId()).collect(Collectors.toList());

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
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!notificationReadRepository.existsByIdUserIdAndIdNotificationId(user.getId(), id)) {
            NotificationRead.NotificationReadId readIdObj = new NotificationRead.NotificationReadId(user.getId(), id);
            NotificationRead readRecord = new NotificationRead();
            readRecord.setId(readIdObj);
            notificationReadRepository.save(readRecord);
        }

        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }
}
