import React from 'react';
import { motion } from 'framer-motion';
import BrandLogo from '../components/BrandLogo';

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-neutral-light flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-pattern">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center mb-6"
                >
                    <BrandLogo variant="full" className="h-20" />
                </motion.div>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
            >
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-neutral-200/60 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
                    {children}
                </div>
            </motion.div>

            <div className="mt-8 text-center text-xs text-gray-400">
                &copy; 2026 MRS. DEORE PREMIX. All rights reserved.
            </div>
        </div>
    );
};

export default AuthLayout;
