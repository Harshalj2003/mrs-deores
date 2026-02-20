import React from 'react';
import BrandLogo from '../components/BrandLogo';
import { motion } from 'framer-motion';

interface CheckoutLayoutProps {
    children: React.ReactNode;
}

const CheckoutLayout: React.FC<CheckoutLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Minimal Header */}
            <header className="bg-white border-b border-gray-100 py-4 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <BrandLogo variant="full" className="h-10" />

                    <div className="text-xs font-black uppercase tracking-widest text-gray-400">
                        Secure Checkout
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {children}
                </motion.div>
            </main>

            <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-gray-100 text-center text-xs text-gray-400">
                &copy; 2026 MRS. DEORE PREMIX. Secured by 256-bit SSL encryption.
            </footer>
        </div>
    );
};

export default CheckoutLayout;
