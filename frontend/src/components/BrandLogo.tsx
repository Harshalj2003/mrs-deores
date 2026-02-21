import React from 'react';
import { clsx } from 'clsx';

interface BrandLogoProps {
    variant?: 'full' | 'icon' | 'text'; // Kept for backwards compatibility but ignored
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
}

const sizeMap = {
    sm: 'h-8 md:h-10', // Significantly larger textual baseline
    md: 'h-10 md:h-12',
    lg: 'h-12 md:h-16',
};

const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', className }) => {
    return (
        <div className={clsx("flex items-center", className)}>
            <img
                src="/web_name.svg"
                alt="MRS. DEORE PREMIX"
                className={clsx(
                    sizeMap[size],
                    "object-contain transition-all duration-300",
                    className
                )}
            />
        </div>
    );
};

export default BrandLogo;
