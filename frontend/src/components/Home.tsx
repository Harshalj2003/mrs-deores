import React, { useState, useEffect } from "react";
import SEO from "./SEO";
import api from "../services/api";
import type { Category } from "../types/catalog.types";
import CategoryGrid from "./CategoryGrid";
import { motion } from "framer-motion";
import SearchBar from "./SearchBar";
import { useLanguage } from "../contexts/LanguageContext";
import FAQSection from "./FAQSection";
import ScrollSection from "./ScrollSection";
import { staggerContainer, staggerCard, defaultViewport } from "../utils/scrollAnimations";

const homeFAQs = [
    {
        question: "Are MRS. DEORE products 100% homemade?",
        answer: "Absolutely. Every premix, snack, and masala is handcrafted in our home kitchen using traditional methods passed down through generations. We do not use commercial machinery for processing."
    },
    {
        question: "Do you use any artificial preservatives or colors?",
        answer: "No. Our commitment to tradition means zero artificial preservatives, MSG, or synthetic colors. We rely on natural preservation techniques like sun-drying and traditional spice roasting."
    },
    {
        question: "What is the shelf life of the premixes?",
        answer: "Most of our premixes have a shelf life of 3 to 6 months when stored in a cool, dry place in an airtight container. Specific expiry details are provided on each package."
    },
    {
        question: "Do you take custom orders for weddings or events?",
        answer: "Yes, we specialize in bulk traditional orders for special occasions. Please contact us via WhatsApp to discuss custom quantities, branded packaging, or specific dietary requirements."
    }
];

const Home: React.FC = () => {
    const { t } = useLanguage();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [gridColsMobile, setGridColsMobile] = useState(2);
    const [gridColsDesktop, setGridColsDesktop] = useState(4);
    const [heroEnabled, setHeroEnabled] = useState(true);
    const [showTagline, setShowTagline] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            const cachedSettings = localStorage.getItem('siteSettings');
            const cachedCats = localStorage.getItem('siteCategories');

            if (cachedSettings) {
                try {
                    const s = JSON.parse(cachedSettings);
                    if (s.grid_categories_mobile) setGridColsMobile(parseInt(s.grid_categories_mobile));
                    if (s.grid_categories_desktop) setGridColsDesktop(parseInt(s.grid_categories_desktop));
                    setHeroEnabled(s.brand_hero_enabled !== 'false');
                    setShowTagline(s.brand_show_tagline !== 'false');
                } catch (e) { }
            }
            if (cachedCats) {
                try { setCategories(JSON.parse(cachedCats)); } catch (e) { }
            }

            try {
                const [catRes, settingsRes] = await Promise.all([
                    api.get("categories"),
                    api.get("settings").catch(() => ({ data: {} }))
                ]);

                const cats = catRes.data;
                const s = settingsRes.data || {};

                setCategories(cats);
                localStorage.setItem('siteCategories', JSON.stringify(cats));

                if (s.grid_categories_mobile) setGridColsMobile(parseInt(s.grid_categories_mobile));
                if (s.grid_categories_desktop) setGridColsDesktop(parseInt(s.grid_categories_desktop));
                setHeroEnabled(s.brand_hero_enabled !== 'false');
                setShowTagline(s.brand_show_tagline !== 'false');

                if (cachedSettings) {
                    const merged = { ...JSON.parse(cachedSettings), ...s };
                    localStorage.setItem('siteSettings', JSON.stringify(merged));
                } else {
                    localStorage.setItem('siteSettings', JSON.stringify(s));
                }
            } catch (error) {
                console.error("Error fetching home data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[100dvh]">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center font-serif italic text-primary text-2xl"
            >
                <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    Preparing MRS.DEORE's Traditions...
                </motion.div>
            </motion.div>
        </div>
    );

    return (
        <div className="scroll-snap-container bg-background">
            <SEO
                title="Mrs. Deore Premix – Authentic Homemade Traditions"
                description="Explore authentic homemade premix products by Mrs. Deore. Handcrafted masalas, snacks, and traditional recipes made with love and natural ingredients."
                url="https://mrs-deores.onrender.com/"
            />

            {/* ════════════════════════════════════════════════════
                WORLD 1: Hero — Warm golden cream world
                The first thing you see. Feels warm, inviting, like home.
                ════════════════════════════════════════════════════ */}
            {heroEnabled && (
                <ScrollSection
                    bg="linear-gradient(145deg, #FFF8E7 0%, #FFECD2 40%, #FFF0D6 100%)"
                    darkBg="linear-gradient(145deg, #1A0F07 0%, #271608 40%, #1E1208 100%)"
                    pattern="dots"
                    patternColor="rgba(212, 175, 55, 0.06)"
                    revealStyle="zoom"
                    className="py-6 sm:py-10"
                >
                    <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8">
                        <div className="pb-8 sm:pb-16 lg:max-w-2xl lg:w-full pt-4">
                            <div className="mt-4 sm:mt-6">
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                    className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-black uppercase tracking-widest mb-4"
                                >
                                    ✨ Est. Traditional Taste
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                    className="mb-6 relative z-[50]"
                                >
                                    <SearchBar mode="expanded" />
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
                                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    transition={{ delay: 0.45, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                    className="relative z-0 text-4xl tracking-tight font-black text-[#5D4037] sm:text-5xl md:text-6xl font-serif leading-tight"
                                >
                                    <span className="block xl:inline">Authentic Homemade</span>{' '}
                                    <span className="block text-secondary xl:inline">Tradition in every bite</span>
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6, duration: 0.5 }}
                                    className={`mt-3 text-base text-[#8D6E63] sm:mt-5 sm:text-lg sm:max-w-xl md:mt-5 md:text-xl font-medium ${showTagline ? '' : 'hidden'}`}
                                >
                                    Where tradition meets taste. Every product is a tribute to authentic flavours, crafted with purity, passion, and time-honoured recipes.
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7, duration: 0.5 }}
                                    className="mt-6 sm:mt-10 flex flex-wrap gap-3 sm:gap-4"
                                >
                                    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                                        <a href="#shop" className="flex items-center justify-center px-5 py-2.5 sm:px-8 sm:py-4 border border-transparent text-sm sm:text-base font-bold rounded-xl text-white bg-primary hover:bg-accent shadow-lg shadow-primary/30 transition-all">
                                            {t('shopByCat')}
                                        </a>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                                        <a href="/about" className="flex items-center justify-center px-5 py-2.5 sm:px-8 sm:py-4 border-2 border-accent/20 text-sm sm:text-base font-bold rounded-xl text-accent bg-transparent hover:bg-accent/5 transition-all">
                                            {t('aboutUs')}
                                        </a>
                                    </motion.div>
                                </motion.div>

                                {/* Scroll hint — subtle animation */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.2 }}
                                    className="mt-6 sm:mt-12 flex flex-col items-center sm:items-start"
                                >
                                    <motion.div
                                        animate={{ y: [0, 8, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                        className="flex flex-col items-center gap-1"
                                    >
                                        <span className="text-[10px] uppercase tracking-[0.3em] font-black text-[#8D6E63]/50">Scroll to explore</span>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#8D6E63]/40">
                                            <path d="M10 4v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Decorative right panel */}
                    <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block opacity-20"
                        style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                </ScrollSection>
            )}

            {/* ════════════════════════════════════════════════════
                WORLD 2: Categories — Clean white with depth
                Suddenly you're in a clean, modern catalog. The
                warm gold world is gone, you're in a focused shop.
                ════════════════════════════════════════════════════ */}
            <ScrollSection
                id="shop"
                bg="linear-gradient(180deg, #FFFFFF 0%, #FFF9F0 50%, #FFFFFF 100%)"
                darkBg="linear-gradient(180deg, #1A0F07 0%, #271608 50%, #1A0F07 100%)"
                pattern="radial"
                patternColor="rgba(194, 65, 12, 0.03)"
                revealStyle="curtain"
                className="py-6 sm:py-10"
            >
                <CategoryGrid categories={categories} mobileCols={gridColsMobile} desktopCols={gridColsDesktop} />
            </ScrollSection>

            {/* ════════════════════════════════════════════════════
                WORLD 3: FAQ — Deep earthy wisdom section
                A darker, serious tone. Knowledge & trust.
                ════════════════════════════════════════════════════ */}
            <ScrollSection
                bg="linear-gradient(180deg, #F9F0E3 0%, #F5E6D0 50%, #F0DCC0 100%)"
                darkBg="linear-gradient(180deg, #150C04 0%, #1E1208 50%, #150C04 100%)"
                pattern="waves"
                patternColor="rgba(139, 90, 43, 0.03)"
                revealStyle="blur"
                className="py-8 sm:py-12"
            >
                <div className="max-w-7xl mx-auto px-4">
                    <FAQSection items={homeFAQs} />
                </div>
            </ScrollSection>

            {/* ════════════════════════════════════════════════════
                WORLD 4: Trust Strip — Bold, confident, branded
                Like a billboard — high contrast, impactful.
                ════════════════════════════════════════════════════ */}
            <ScrollSection
                bg="linear-gradient(135deg, #7F1D1D 0%, #991B1B 30%, #C2410C 70%, #B45309 100%)"
                darkBg="linear-gradient(135deg, #4A0E0E 0%, #5C1010 30%, #7B2D08 70%, #6B3707 100%)"
                pattern="dots"
                patternColor="rgba(255, 255, 255, 0.04)"
                revealStyle="split"
                className="py-10 sm:py-14"
            >
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={defaultViewport}
                    variants={staggerContainer}
                    className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 text-center"
                >
                    <motion.div variants={staggerCard} className="flex flex-col items-center gap-3">
                        <span className="text-4xl sm:text-5xl">✨</span>
                        <span className="text-white/90 uppercase tracking-[0.25em] text-xs sm:text-sm font-black">100% Homemade</span>
                        <span className="text-white/50 text-xs font-medium max-w-[200px]">Every product crafted by hand in our kitchen</span>
                    </motion.div>
                    <motion.div variants={staggerCard} className="flex flex-col items-center gap-3">
                        <span className="text-4xl sm:text-5xl">🌿</span>
                        <span className="text-white/90 uppercase tracking-[0.25em] text-xs sm:text-sm font-black">Natural Ingredients</span>
                        <span className="text-white/50 text-xs font-medium max-w-[200px]">Zero preservatives, MSG, or artificial colors</span>
                    </motion.div>
                    <motion.div variants={staggerCard} className="flex flex-col items-center gap-3">
                        <span className="text-4xl sm:text-5xl">📦</span>
                        <span className="text-white/90 uppercase tracking-[0.25em] text-xs sm:text-sm font-black">Bulk Pricing</span>
                        <span className="text-white/50 text-xs font-medium max-w-[200px]">Special rates for weddings & events</span>
                    </motion.div>
                </motion.div>
            </ScrollSection>
        </div>
    );
};

export default Home;
