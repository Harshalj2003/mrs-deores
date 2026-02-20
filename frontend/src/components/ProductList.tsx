import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProducts, getCategories } from "../services/ProductService";
import type { Product, Category } from "../types/catalog.types";
import ProductCard from "./ProductCard";
import EmptyState from "./EmptyState";
import { SearchX } from "lucide-react";

const ProductList: React.FC = () => {
    const { categoryId } = useParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        const fetchData = async () => {
            try {
                // Parallel fetch
                const [allCats, productsData] = await Promise.all([
                    getCategories(),
                    getProducts(categoryId ? Number(categoryId) : undefined)
                ]);

                if (categoryId) {
                    const cat = allCats.find(c => c.id === Number(categoryId));
                    setCategory(cat || null);
                }

                setProducts(productsData);
            } catch (err) {
                console.error("Error loading products:", err);
                setError("Failed to load products. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [categoryId]);

    if (loading) {
        return (
            <div className="min-h-screen pt-32 pb-12 flex justify-center">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-20 flex justify-center items-center">
                <EmptyState
                    icon={SearchX}
                    title="Oops!"
                    description={error}
                    actionLabel="Try Again"
                    actionPath="/"
                />
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {category && (
                    <div className="mb-12 text-center">
                        <span className="text-secondary font-black uppercase tracking-widest text-xs mb-2 block">Collection</span>
                        <h1 className="text-4xl md:text-5xl font-black text-primary font-serif mb-4">{category.name}</h1>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">{category.description}</p>
                    </div>
                )}

                {products.length === 0 ? (
                    <EmptyState
                        icon={SearchX}
                        title="No products found"
                        description="We couldn't find any products in this category."
                        actionLabel="Browse All"
                        actionPath="/"
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 gap-x-8 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-10">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
