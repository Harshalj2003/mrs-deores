import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperModalProps {
    isOpen: boolean;
    imageFile: File | null;
    aspectRatio: number; // e.g., 1 for square, 4/5 for portraits
    onClose: () => void;
    onCropComplete: (croppedFile: File) => void;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
    isOpen,
    imageFile,
    aspectRatio,
    onClose,
    onCropComplete
}) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Create a local object URL for the Cropper
    const imageUrl = React.useMemo(() => {
        if (imageFile) {
            return URL.createObjectURL(imageFile);
        }
        return '';
    }, [imageFile]);

    // Clean up URL object on unmount
    React.useEffect(() => {
        return () => {
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        };
    }, [imageUrl]);

    const handleCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.src = url;
        });

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area
    ): Promise<File | null> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) return null;

        const MAX_WIDTH = 1080;
        let targetWidth = pixelCrop.width;
        let targetHeight = pixelCrop.height;

        if (targetWidth > MAX_WIDTH) {
            const ratio = MAX_WIDTH / targetWidth;
            targetWidth = MAX_WIDTH;
            targetHeight = Math.round(targetHeight * ratio);
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            targetWidth,
            targetHeight
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    resolve(null);
                    return;
                }
                // Convert blob back to a File object, maintaining the original type
                const file = new File([blob], imageFile?.name || 'cropped.jpg', {
                    type: imageFile?.type || 'image/jpeg',
                    lastModified: Date.now(),
                });
                resolve(file);
            }, imageFile?.type || 'image/jpeg', 0.9); // High quality compression
        });
    };

    const handleConfirm = async () => {
        if (!croppedAreaPixels || !imageFile) return;

        try {
            setIsProcessing(true);
            const croppedFile = await getCroppedImg(imageUrl, croppedAreaPixels);
            if (croppedFile) {
                onCropComplete(croppedFile);
            }
        } catch (e) {
            console.error("Cropping failed", e);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen || !imageFile) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col h-[85vh] md:h-[600px]"
                >
                    {/* Header */}
                    <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-neutral-800">
                        <h3 className="text-xl font-black font-serif text-gray-900 dark:text-white">Crop Image</h3>
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-gray-500 disabled:opacity-50"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Cropper Container */}
                    <div className="relative flex-1 bg-neutral-900 overflow-hidden">
                        <Cropper
                            image={imageUrl}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspectRatio}
                            onCropChange={setCrop}
                            onCropComplete={handleCropComplete}
                            onZoomChange={setZoom}
                            showGrid={true}
                            restrictPosition={true}
                        />
                    </div>

                    {/* Controls Footer */}
                    <div className="p-6 bg-white dark:bg-neutral-900 border-t border-gray-100 dark:border-neutral-800 flex flex-col gap-6">
                        {/* Zoom Slider */}
                        <div className="flex items-center gap-4 px-4">
                            <ZoomOut className="h-5 w-5 text-gray-400" />
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="flex-1 accent-primary h-2 bg-gray-200 dark:bg-neutral-800 rounded-full appearance-none outline-none"
                            />
                            <ZoomIn className="h-5 w-5 text-gray-400" />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={onClose}
                                disabled={isProcessing}
                                className="px-6 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isProcessing}
                                className="flex items-center gap-2 bg-primary text-white px-8 py-2.5 rounded-xl font-bold tracking-wide hover:bg-primary-dark transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                            >
                                {isProcessing ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Check className="h-5 w-5" />
                                        Confirm Crop
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ImageCropperModal;
