import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface BrandLogoProps {
    variant?: 'full' | 'icon' | 'text';
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
}

const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'h-6', full: 'h-10' },
    md: { icon: 'w-10 h-10', text: 'h-8', full: 'h-12' },
    lg: { icon: 'w-14 h-14', text: 'h-10', full: 'h-14' },
};

const BrandLogo: React.FC<BrandLogoProps> = ({ variant = 'full', className, size = 'md', showText = true }) => {
    const s = sizeMap[size];

    if (variant === 'icon') {
        return (
            <motion.div whileHover={{ rotate: 10 }} className={clsx("relative", className)}>
                <img
                    src="/logo.svg"
                    alt="MRS. DEORE PREMIX Logo"
                    className={clsx(s.icon, "object-contain drop-shadow-md")}
                />
            </motion.div>
        );
    }

    if (variant === 'text') {
        return (
            <img
                src="/web_name.svg"
                alt="MRS. DEORE PREMIX"
                className={clsx(s.text, "object-contain dark:invert", className)}
            />
        );
    }

    // Full variant (Icon + Text)
    return (
        <div className={clsx("flex items-center gap-2", className)}>
            <motion.img
                whileHover={{ rotate: 10 }}
                src="/logo.svg"
                alt="MRS. DEORE PREMIX Logo"
                className={clsx(s.icon, "object-contain drop-shadow-sm bg-white rounded-full p-0.5")}
            />
            {showText && (
                <img
                    src="/web_name.svg"
                    alt="MRS. DEORE PREMIX"
                    className={clsx(s.text, "object-contain max-w-[120px] dark:invert")}
                />
            )}
        </div>
    );
};

export default BrandLogo;
