import React from "react";
import { Link } from "react-router-dom";
import type { Category } from "../types/catalog.types";
import { motion } from "framer-motion";

interface CategoryGridProps {
    categories: Category[];
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const item = {
        hidden: { y: 30, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 120 } }
    };

    return (
        <div className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="lg:text-center mb-16"
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
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 gap-x-8 lg:grid-cols-3"
                >
                    {categories.map((category) => (
                        <motion.div key={category.id} variants={item}>
                            <Link to={`/category/${category.id}`} className="group block">
                                <motion.div
                                    whileHover={{ y: -8 }}
                                    className="relative w-full aspect-[4/5] bg-neutral-light rounded-[2rem] overflow-hidden shadow-sm transition-shadow group-hover:shadow-2xl group-hover:shadow-primary/10"
                                >
                                    <img
                                        src={category.imageUrl}
                                        alt={category.name}
                                        className="w-full h-full object-center object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </motion.div>
                                <div className="mt-6 text-center">
                                    <h3 className="text-2xl font-black text-gray-900 font-serif group-hover:text-primary transition-colors">{category.name}</h3>
                                    <p className="mt-2 text-sm text-gray-500 font-medium max-w-[250px] mx-auto line-clamp-2">{category.description}</p>
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
