package com.mrsdeores.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class CloudinaryService {

    private static final Logger logger = LoggerFactory.getLogger(CloudinaryService.class);

    private final Cloudinary cloudinary;

    @Value("${app.media.max-file-size-mb:10}")
    private int maxFileSizeMb;

    @Value("${app.media.allowed-formats:jpg,jpeg,png,webp,mp4,pdf}")
    private String allowedFormats;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /**
     * Generates a signed upload signature for the given media context.
     * Frontend uploads DIRECTLY to Cloudinary using these params.
     * Backend never proxies file bytes.
     *
     * @param mediaType CATEGORY | PRODUCT | DOCUMENT
     * @param entityId  Optional entity ID for folder path (e.g. products/123/)
     * @return Signed params map to be sent to frontend
     */
    public Map<String, Object> generateUploadSignature(String mediaType, Long entityId) {
        String folder = resolveFolder(mediaType, entityId);
        String resourceType = resolveResourceType(mediaType);

        long timestamp = System.currentTimeMillis() / 1000L;

        Map<String, Object> paramsToSign = new HashMap<>();
        paramsToSign.put("timestamp", timestamp);
        paramsToSign.put("folder", folder);
        paramsToSign.put("resource_type", resourceType);
        paramsToSign.put("max_file_size", maxFileSizeMb * 1024 * 1024);

        // Apply auto quality and format optimization for images
        if ("image".equals(resourceType)) {
            paramsToSign.put("allowed_formats", allowedFormats);
            paramsToSign.put("transformation", "f_auto,q_auto");
        }

        String signature;
        try {
            signature = cloudinary.apiSignRequest(paramsToSign,
                    (String) cloudinary.config.asMap().get("api_secret"));
        } catch (Exception e) {
            logger.error("Failed to generate Cloudinary signature for mediaType={}", mediaType, e);
            throw new RuntimeException("Signature generation failed", e);
        }

        Map<String, Object> result = new HashMap<>(paramsToSign);
        result.put("signature", signature);
        result.put("api_key", cloudinary.config.asMap().get("api_key"));
        result.put("cloud_name", cloudinary.config.asMap().get("cloud_name"));
        result.put("resource_type", resourceType);
        result.remove("max_file_size"); // Do not expose size limit details to frontend

        logger.info("Signature generated for mediaType={} folder={}", mediaType, folder);
        return result;
    }

    /**
     * Deletes a media asset from Cloudinary by its public_id.
     * Logs on failure — does NOT throw (DB operation already committed).
     */
    public void deleteMedia(String publicId, String resourceType) {
        if (publicId == null || publicId.isBlank()) {
            logger.debug("Skipping Cloudinary delete — publicId is blank");
            return;
        }
        try {
            String type = (resourceType != null) ? resourceType : "image";
            @SuppressWarnings("unchecked")
            Map<String, Object> result = (Map<String, Object>) cloudinary.uploader().destroy(publicId,
                    ObjectUtils.asMap("resource_type", type));
            logger.info("Cloudinary delete result for publicId={}: {}", publicId, result.get("result"));
        } catch (Exception e) {
            // Log but do NOT rethrow — DB update already succeeded, media delete is
            // best-effort
            logger.error("Cloudinary media delete failed for publicId={}. Cleanup needed.", publicId, e);
        }
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private String resolveFolder(String mediaType, Long entityId) {
        return switch (mediaType.toUpperCase()) {
            case "CATEGORY" -> "mrs-deores/categories";
            case "PRODUCT" -> (entityId != null)
                    ? "mrs-deores/products/" + entityId
                    : "mrs-deores/products";
            case "DOCUMENT" -> "mrs-deores/documents";
            default -> "mrs-deores/misc";
        };
    }

    private String resolveResourceType(String mediaType) {
        return switch (mediaType.toUpperCase()) {
            case "DOCUMENT" -> "raw";
            case "VIDEO" -> "video";
            default -> "image";
        };
    }
}
