import React, { useState, useEffect } from "react";
import api from "../services/api";
import type { Category } from "../types/catalog.types";
import CategoryGrid from "./CategoryGrid";
import { motion } from "framer-motion";

const Home: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("categories").then(
            (response) => {
                setCategories(response.data);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching categories:", error);
                setLoading(false);
            }
        );
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100
            }
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center font-serif italic text-primary animate-pulse text-2xl">
                Preparing MRS.DEORE's Traditions...
            </div>
        </div>
    );

    return (
        <div className="bg-background min-h-screen">
            {/* Hero Section */}
            <div className="relative bg-primary overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-primary sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={containerVariants}
                                className="sm:text-center lg:text-left"
                            >
                                <motion.h1
                                    variants={itemVariants}
                                    className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl font-serif"
                                >
                                    <span className="block xl:inline">Authentic Homemade</span>{' '}
                                    <span className="block text-secondary xl:inline">Tradition in every bite</span>
                                </motion.h1>
                                <motion.p
                                    variants={itemVariants}
                                    className="mt-3 text-base text-gray-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
                                >
                                    Premium premixes, snacks, and masalas handcrafted with love and traditional recipes passed down through generations.
                                </motion.p>
                                <motion.div
                                    variants={itemVariants}
                                    className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="rounded-md shadow"
                                    >
                                        <a href="#shop" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors">
                                            Shop Now
                                        </a>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </main>
                    </div>
                </div>
            </div>

            <motion.div
                id="shop"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <CategoryGrid categories={categories} />
            </motion.div>

            {/* Trust Section */}
            <div className="bg-secondary/10 py-12">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center uppercase tracking-widest text-sm font-bold text-accent">
                    <motion.div whileInView={{ y: [10, 0], opacity: [0, 1] }} viewport={{ once: true }}>✨ 100% Homemade</motion.div>
                    <motion.div whileInView={{ y: [10, 0], opacity: [0, 1] }} viewport={{ once: true }} transition={{ delay: 0.1 }}>🌿 Natural Ingredients</motion.div>
                    <motion.div whileInView={{ y: [10, 0], opacity: [0, 1] }} viewport={{ once: true }} transition={{ delay: 0.2 }}>📦 Bulk Pricing Available</motion.div>
                </div>
            </div>
        </div>
    );
};

export default Home;
