import React from 'react';
import { motion } from 'framer-motion';
import BrandLogo from '../components/BrandLogo';

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-neutral-light dark:bg-neutral-900 flex flex-col items-center justify-center overflow-y-auto px-4 py-6 sm:py-10 sm:px-6 lg:px-8 bg-pattern">
            <div className="w-full max-w-[420px] text-center mb-4 sm:mb-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: -10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
                    className="flex justify-center mb-2 sm:mb-4"
                >
                    <BrandLogo variant="full" className="h-14 sm:h-20" />
                </motion.div>
            </div>

            <motion.div
                initial={{ y: 30, opacity: 0, scale: 0.97 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.5, type: 'spring', stiffness: 100 }}
                className="w-full max-w-[420px]"
            >
                <div className="bg-white dark:bg-neutral-800 dark:text-white py-6 px-5 sm:py-8 sm:px-10 shadow-2xl rounded-3xl border border-neutral-200/60 dark:border-neutral-700 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary animate-shimmer" />
                    {children}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-5 sm:mt-8 text-center text-xs text-gray-400"
            >
                &copy; 2026 MRS. DEORE'S PREMIX. All rights reserved.
            </motion.div>
        </div>
    );
};

export default AuthLayout;
