import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface BrandLogoProps {
    variant?: 'full' | 'icon' | 'text';
    className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ variant = 'full', className }) => {

    // Icon-only variant (Circular Logo)
    if (variant === 'icon') {
        return (
            <motion.div
                whileHover={{ rotate: 10 }}
                className={clsx("relative", className)}
            >
                <img
                    src="/logo.svg"
                    alt="MRS. DEORE PREMIX Logo"
                    className="w-20 h-20 object-contain drop-shadow-md"
                />
            </motion.div>
        );
    }

    // Text-only variant (Web Name)
    if (variant === 'text') {
        return (
            <img
                src="/web_name.svg"
                alt="MRS. DEORE PREMIX"
                className={clsx("h-12 object-contain", className)}
            />
        );
    }

    // Full variant (Icon + Text)
    return (
        <div className={clsx("flex items-center gap-4", className)}>
            <motion.img
                whileHover={{ rotate: 10 }}
                src="/logo.svg"
                alt="MRS. DEORE PREMIX Logo"
                className="w-20 h-20 object-contain drop-shadow-md bg-white rounded-full p-1"
            />
            <img
                src="/web_name.svg"
                alt="MRS. DEORE PREMIX"
                className="h-14 object-contain" // Removed filter overrides
            />
        </div>
    );
};

export default BrandLogo;
