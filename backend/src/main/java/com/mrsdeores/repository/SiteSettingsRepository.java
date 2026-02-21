package com.mrsdeores.repository;

import com.mrsdeores.models.SiteSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SiteSettingsRepository extends JpaRepository<SiteSettings, Long> {
    Optional<SiteSettings> findBySettingKey(String settingKey);
}
