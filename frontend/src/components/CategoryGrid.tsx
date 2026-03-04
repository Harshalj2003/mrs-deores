import React from "react";
import { Link } from "react-router-dom";
import type { Category } from "../types/catalog.types";
import { motion } from "framer-motion";
import { skewReveal, staggerContainer, staggerCard, defaultViewport } from "../utils/scrollAnimations";

interface CategoryGridProps {
    categories: Category[];
    mobileCols?: number;
    desktopCols?: number;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, mobileCols = 2, desktopCols = 4 }) => {
    return (
        <div className="py-4 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header — skew reveal */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={defaultViewport}
                    variants={skewReveal}
                    className="text-center mb-10 sm:mb-14"
                >
                    <h2 className="text-sm text-primary font-black tracking-[0.2em] uppercase mb-2">Heritage</h2>
                    <p className="text-3xl sm:text-4xl leading-tight font-black tracking-tight text-gray-900 sm:text-5xl font-serif">
                        Traditional Categories
                    </p>
                    <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="h-1 w-20 bg-secondary mx-auto mt-6 rounded-full origin-left"
                    />
                </motion.div>

                {/* Category cards — staggered spring entrance */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={defaultViewport}
                    className="grid gap-4 sm:gap-6 md:gap-8 grid-dynamic-cols"
                    style={{
                        '--mobile-cols': mobileCols.toString(),
                        '--desktop-cols': desktopCols.toString(),
                    } as React.CSSProperties}
                >
                    {categories.map((category) => (
                        <motion.div
                            key={category.id}
                            variants={staggerCard}
                        >
                            <Link to={`/category/${category.id}`} className="group block">
                                <motion.div
                                    whileHover={{ y: -10, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                                    className="relative w-full aspect-[4/5] bg-neutral-light rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-sm transition-shadow duration-500 group-hover:shadow-2xl group-hover:shadow-primary/15"
                                >
                                    {category.imageUrl ? (
                                        <img
                                            src={category.imageUrl}
                                            alt={category.name}
                                            className="w-full h-full object-center object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                                            <span className="text-4xl font-black text-primary/20 font-serif">{category.name[0]}</span>
                                        </div>
                                    )}
                                    {/* Hover overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    {/* Hover label floating up */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                                        <span className="text-white text-xs font-black uppercase tracking-widest">Explore →</span>
                                    </div>
                                </motion.div>
                                <div className="mt-4 sm:mt-5 text-center">
                                    <h3 className="text-lg sm:text-xl font-black text-gray-900 font-serif group-hover:text-primary transition-colors">{category.name}</h3>
                                    <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-gray-500 font-medium max-w-[240px] mx-auto line-clamp-2">{category.description}</p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default CategoryGrid;
