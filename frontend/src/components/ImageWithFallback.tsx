import React, { useState } from 'react';
import { clsx } from 'clsx';
import { ImageOff } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
    src,
    alt,
    className,
    fallbackSrc = "https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image",
    ...props
}) => {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    const handleError = () => {
        setError(true);
        setLoading(false);
    };

    const handleLoad = () => {
        setLoading(false);
    };

    if (error || !src) {
        return (
            <div className={clsx("flex items-center justify-center bg-gray-50", className)}>
                <div className="text-center">
                    <ImageOff className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">No Image</span>
                </div>
            </div>
        );
    }

    return (
        <div className={clsx("relative overflow-hidden", className)}>
            {loading && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse z-10" />
            )}
            <img
                src={src}
                alt={alt}
                onError={handleError}
                onLoad={handleLoad}
                className={clsx(
                    "w-full h-full object-cover transition-opacity duration-300",
                    loading ? "opacity-0" : "opacity-100"
                )}
                {...props}
            />
        </div>
    );
};

export default ImageWithFallback;
