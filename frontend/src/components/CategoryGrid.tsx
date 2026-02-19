import React from "react";
import { Link } from "react-router-dom";
import type { Category } from "../types/catalog.types";

interface CategoryGridProps {
    categories: Category[];
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
    return (
        <div className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:text-center mb-10">
                    <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Shop by</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl font-serif">
                        Traditional Categories
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:gap-x-8">
                    {categories.map((category) => (
                        <Link key={category.id} to={`/category/${category.id}`} className="group">
                            <div className="w-full aspect-w-16 aspect-h-9 bg-gray-200 rounded-2xl overflow-hidden xl:aspect-w-7 xl:aspect-h-8 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                                <img
                                    src={category.imageUrl}
                                    alt={category.name}
                                    className="w-full h-64 object-center object-cover group-hover:opacity-75 transition-opacity"
                                />
                            </div>
                            <h3 className="mt-4 text-xl font-bold text-gray-900 font-serif">{category.name}</h3>
                            <p className="mt-1 text-sm text-gray-500">{category.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryGrid;
