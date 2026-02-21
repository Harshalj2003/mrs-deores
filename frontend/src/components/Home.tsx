import React, { useState, useEffect } from "react";
import api from "../services/api";
import type { Category } from "../types/catalog.types";
import CategoryGrid from "./CategoryGrid";
import { motion } from "framer-motion";
import SearchBar from "./SearchBar";
import { useLanguage } from "../contexts/LanguageContext";

const Home: React.FC = () => {
    const { t } = useLanguage();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [gridColsMobile, setGridColsMobile] = useState(2);
    const [heroEnabled, setHeroEnabled] = useState(true);
    const [showTagline, setShowTagline] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [catRes, settingsRes] = await Promise.all([
                    api.get("categories"),
                    api.get("settings").catch(() => ({ data: {} }))
                ]);
                setCategories(catRes.data);
                const s = settingsRes.data || {};
                if (s.grid_categories_mobile) setGridColsMobile(parseInt(s.grid_categories_mobile));
                setHeroEnabled(s.brand_hero_enabled !== 'false');
                setShowTagline(s.brand_show_tagline !== 'false');
            } catch (error) {
                console.error("Error fetching home data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
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
            {/* Hero Section — conditionally shown based on brand_hero_enabled */}
            {heroEnabled && (
                <div className="relative bg-[#FFF8E7] overflow-hidden">
                    {/* Decorative Pattern Background */}
                    <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-10">
                            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={containerVariants}
                                    className="sm:text-center lg:text-left"
                                >
                                    <motion.div variants={itemVariants} className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-black uppercase tracking-widest mb-4">
                                        ✨ Est. Traditional Taste
                                    </motion.div>

                                    {/* Smart Search Bar — expanded on home page */}
                                    <motion.div variants={itemVariants} className="mb-6">
                                        <SearchBar mode="expanded" />
                                    </motion.div>
                                    <motion.h1
                                        variants={itemVariants}
                                        className="text-4xl tracking-tight font-black text-[#5D4037] sm:text-5xl md:text-6xl font-serif leading-tight"
                                    >
                                        <span className="block xl:inline">Authentic Homemade</span>{' '}
                                        <span className="block text-secondary xl:inline">Tradition in every bite</span>
                                    </motion.h1>
                                    <motion.p
                                        variants={itemVariants}
                                        className={`mt-3 text-base text-[#8D6E63] sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 font-medium ${showTagline ? '' : 'hidden'
                                            }`}
                                    >
                                        Experience the nostalgia of grandmother's kitchen. Premium premixes, snacks, and masalas handcrafted with love and generations-old recipes.
                                    </motion.p>
                                    <motion.div
                                        variants={itemVariants}
                                        className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start gap-4"
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <a href="#shop" className="flex items-center justify-center px-5 py-2.5 sm:px-8 sm:py-4 border border-transparent text-sm sm:text-base font-bold rounded-xl text-white bg-primary hover:bg-accent md:text-base shadow-lg shadow-primary/30 transition-all">
                                                {t('shopByCat')}
                                            </a>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <a href="/about" className="flex items-center justify-center px-5 py-2.5 sm:px-8 sm:py-4 border-2 border-accent/20 text-sm sm:text-base font-bold rounded-xl text-accent bg-transparent hover:bg-accent/5 transition-all">
                                                {t('aboutUs')}
                                            </a>
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            </main>
                        </div>
                    </div>

                    {/* Decorative Image/Pattern Right Side - purely decorative for now */}
                    <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block bg-[#FFECB3]/20" style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '30px 30px', opacity: 0.3 }}></div>
                </div>
            )}

            <motion.div
                id="shop"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <CategoryGrid categories={categories} mobileCols={gridColsMobile} />
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
