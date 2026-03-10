import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, X } from 'lucide-react';

interface StockLimitModalProps {
    isOpen: boolean;
    productName: string;
    onClose: () => void;
    onConfirm: () => void;
}

const StockLimitModal: React.FC<StockLimitModalProps> = ({ isOpen, productName, onClose, onConfirm }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative overflow-hidden flex flex-col"
                    >
                        <div className="p-6 sm:p-8 text-center flex flex-col items-center">
                            <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <Package className="h-8 w-8" />
                            </div>

                            <h3 className="text-xl sm:text-2xl font-black font-serif text-gray-900 mb-2">
                                Stock Limit Reached
                            </h3>
                            <p className="text-gray-500 text-sm mb-6 max-w-[280px]">
                                You have reached the maximum available stock for <strong className="text-gray-900">{productName}</strong>.
                                <br /><br />
                                Would you like to place a bulk custom order instead?
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 w-full">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-100 text-gray-500 font-bold hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                >
                                    No, stay here
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-accent shadow-lg shadow-primary/20 transition-colors"
                                >
                                    Yes, Custom Order
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default StockLimitModal;
