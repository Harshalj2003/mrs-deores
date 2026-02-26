import api from './api';

export type MediaType = 'CATEGORY' | 'PRODUCT' | 'DOCUMENT' | 'VIDEO';

export interface CloudinaryUploadResult {
    secureUrl: string;
    publicId: string;
    resourceType: string;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4'];
const MAX_FILE_SIZE_MB = 10;

function validateFile(file: File, mediaType: MediaType): void {
    const allowedTypes = mediaType === 'VIDEO'
        ? ALLOWED_VIDEO_TYPES
        : ALLOWED_IMAGE_TYPES;

    if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type "${file.type}" is not allowed. Use: ${allowedTypes.join(', ')}`);
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        throw new Error(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
    }
}

/**
 * Uploads a file directly to Cloudinary using a backend-signed signature.
 * Backend never receives the file bytes — only signs the request.
 *
 * Flow:
 *  1. Validate file type + size (client-side first line of defence)
 *  2. Request signed params from POST /api/media/signature
 *  3. POST file + signed params directly to Cloudinary
 *  4. Return { secureUrl, publicId, resourceType }
 */
export async function uploadToCloudinary(
    file: File,
    mediaType: MediaType,
    entityId?: number
): Promise<CloudinaryUploadResult> {
    // 1. Client-side validation
    validateFile(file, mediaType);

    // 2. Get signed upload params from backend
    const sigRes = await api.post('/media/signature', {
        mediaType,
        entityId: entityId ?? null,
    });

    const {
        signature,
        api_key,
        cloud_name,
        timestamp,
        folder,
        resource_type,
        transformation,
        allowed_formats,
    } = sigRes.data;

    // 3. Build FormData for direct Cloudinary upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signature);
    formData.append('api_key', api_key);
    formData.append('timestamp', String(timestamp));
    formData.append('folder', folder);
    if (transformation) formData.append('transformation', transformation);
    if (allowed_formats) formData.append('allowed_formats', allowed_formats);

    // 4. Upload directly to Cloudinary (no backend proxy)
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/${resource_type}/upload`;
    const cloudRes = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
    });

    if (!cloudRes.ok) {
        const err = await cloudRes.text();
        throw new Error(`Cloudinary upload failed: ${err}`);
    }

    const cloudData = await cloudRes.json();
    return {
        secureUrl: cloudData.secure_url,
        publicId: cloudData.public_id,
        resourceType: cloudData.resource_type ?? 'image',
    };
}
