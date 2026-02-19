import React, { useState, useEffect } from "react";
import api from "../services/api";
import type { Category } from "../types/catalog.types";
import CategoryGrid from "./CategoryGrid";

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

    if (loading) return <div className="text-center py-20">Loading MRS.DEORE's Catalog...</div>;

    return (
        <div className="bg-background min-h-screen">
            {/* Hero Section */}
            <div className="relative bg-primary overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-primary sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl font-serif">
                                    <span className="block xl:inline">Authentic Homemade</span>{' '}
                                    <span className="block text-secondary xl:inline">Tradition in every bite</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    Premium premixes, snacks, and masalas handcrafted with love and traditional recipes passed down through generations.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    <div className="rounded-md shadow">
                                        <a href="#shop" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                                            Shop Now
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>

            <div id="shop">
                <CategoryGrid categories={categories} />
            </div>

            {/* Trust Section */}
            <div className="bg-secondary/10 py-12">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center uppercase tracking-widest text-sm font-bold text-accent">
                    <div>✨ 100% Homemade</div>
                    <div>🌿 Natural Ingredients</div>
                    <div>📦 Bulk Pricing Available</div>
                </div>
            </div>
        </div>
    );
};

export default Home;
