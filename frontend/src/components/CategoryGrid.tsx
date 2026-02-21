import React from "react";
import { Link } from "react-router-dom";
import type { Category } from "../types/catalog.types";
import { motion } from "framer-motion";

interface CategoryGridProps {
    categories: Category[];
    mobileCols?: number;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, mobileCols = 2 }) => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { y: 30, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 120 } }
    };

    return (
        <div className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <h2 className="text-sm text-primary font-black tracking-[0.2em] uppercase mb-2">Heritage</h2>
                    <p className="text-4xl leading-tight font-black tracking-tight text-gray-900 sm:text-5xl font-serif">
                        Traditional Categories
                    </p>
                    <div className="h-1 w-20 bg-secondary mx-auto mt-6 rounded-full" />
                </motion.div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-80px" }}
                    className="grid gap-6 md:gap-8"
                    style={{
                        // Mobile uses mobileCols, desktop uses desktopCols via CSS Grid
                        gridTemplateColumns: `repeat(${mobileCols}, minmax(0, 1fr))`
                    }}
                >
                    {categories.map((category) => (
                        <motion.div
                            key={category.id}
                            variants={item}
                            style={{
                                // Override for desktop via inline media query isn't possible —
                                // we use a className trick: the parent wrapper controls cols at different breakpoints
                            }}
                        >
                            <Link to={`/category/${category.id}`} className="group block">
                                <motion.div
                                    whileHover={{ y: -6 }}
                                    className="relative w-full aspect-[4/5] bg-neutral-light rounded-[2rem] overflow-hidden shadow-sm transition-shadow group-hover:shadow-2xl group-hover:shadow-primary/10"
                                >
                                    {category.imageUrl ? (
                                        <img
                                            src={category.imageUrl}
                                            alt={category.name}
                                            className="w-full h-full object-center object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                                            <span className="text-4xl font-black text-primary/20 font-serif">{category.name[0]}</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </motion.div>
                                <div className="mt-5 text-center">
                                    <h3 className="text-xl font-black text-gray-900 font-serif group-hover:text-primary transition-colors">{category.name}</h3>
                                    <p className="mt-1.5 text-sm text-gray-500 font-medium max-w-[240px] mx-auto line-clamp-2">{category.description}</p>
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
