import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Home } from 'lucide-react';
import useWishlistStore from '../store/useWishlistStore';
import ProductCard from './ProductCard';
import { useLanguage } from '../contexts/LanguageContext';

const Wishlist: React.FC = () => {
    const { items, syncWithBackend } = useWishlistStore();
    const { t } = useLanguage();

    useEffect(() => {
        syncWithBackend();
    }, [syncWithBackend]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <div className="min-h-screen bg-neutral-light/30 pb-20 pt-10">
            {/* Header Section */}
            <div className="relative mb-12">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent h-64 -z-10" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-primary/10 mb-6 shadow-sm"
                    >
                        <Heart className="h-4 w-4 text-primary fill-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Saved Traditions</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-gray-900 font-serif leading-tight mb-4"
                    >
                        {t('wishlist')}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-500 max-w-xl mx-auto text-lg"
                    >
                        Your curated collection of authentic homemade tastes, ready for your kitchen.
                    </motion.p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatePresence mode="wait">
                    {items.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-[3rem] p-12 md:p-20 text-center shadow-xl shadow-primary/5 border border-primary/5 max-w-2xl mx-auto mt-10"
                        >
                            <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
                                <Heart className="h-10 w-10 text-primary/30" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-4 font-serif">Your collection is empty</h2>
                            <p className="text-gray-500 mb-10 max-w-md mx-auto">
                                Discover something delicious to add to your wishlist today. Authentic recipes from our kitchen to yours.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    to="/"
                                    className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-accent hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                >
                                    <ShoppingBag className="h-4 w-4" /> Start Exploring
                                </Link>
                                <Link
                                    to="/"
                                    className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-100 rounded-full font-black text-xs uppercase tracking-widest hover:border-primary transition-all flex items-center justify-center gap-2"
                                >
                                    <Home className="h-4 w-4" /> Go Home
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="grid"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                        >
                            {items.map((product) => (
                                <motion.div key={product.id} variants={itemVariants}>
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Call to Action */}
            {items.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20"
                >
                    <div className="bg-primary rounded-[3rem] p-10 md:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative shadow-2xl shadow-primary/30">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <ShoppingBag className="h-64 w-64 rotate-12" />
                        </div>
                        <div className="relative z-10 text-center md:text-left">
                            <h3 className="text-3xl md:text-4xl font-black mb-3 font-serif leading-tight">Ready to taste tradition?</h3>
                            <p className="text-white/80 max-w-md">Your saved items are waiting. Bring them home with safe, secure checkout.</p>
                        </div>
                        <Link to="/">
                            <motion.button
                                whileHover={{ x: 10 }}
                                className="relative z-10 bg-white text-primary px-10 py-5 rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-neutral-light transition-all flex items-center gap-3"
                            >
                                Explore All Products <ArrowRight className="h-5 w-5" />
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Wishlist;

