package com.mrsdeores.controllers;

import com.mrsdeores.models.SiteSettings;
import com.mrsdeores.repository.SiteSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SiteSettingsController {

    @Autowired
    private SiteSettingsRepository repository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    /** GET all settings as a flat key-value map */
    @GetMapping
    public Map<String, String> getAllSettings() {
        List<SiteSettings> all = repository.findAll();
        Map<String, String> result = new HashMap<>();
        for (SiteSettings s : all) {
            result.put(s.getSettingKey(), s.getSettingValue());
        }

        // Inject runtime environment keys necessary for frontend integration
        result.put("razorpay_key_id", razorpayKeyId);

        return result;
    }

    /**
     * PATCH batch update — PUT body is a JSON map of { key: value } pairs.
     * Only keys present in the body are updated.
     */
    @PatchMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateSettings(@RequestBody Map<String, String> updates) {
        for (Map.Entry<String, String> entry : updates.entrySet()) {
            SiteSettings setting = repository.findBySettingKey(entry.getKey())
                    .orElseGet(() -> {
                        SiteSettings s = new SiteSettings();
                        s.setSettingKey(entry.getKey());
                        return s;
                    });
            setting.setSettingValue(entry.getValue());
            setting.setUpdatedAt(LocalDateTime.now());
            repository.save(setting);
        }
        return ResponseEntity.ok(updates);
    }
}
