import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProducts, getCategories } from "../services/ProductService";
import type { Product, Category } from "../types/catalog.types";
import ProductCard from "./ProductCard";
import EmptyState from "./EmptyState";
import { SearchX, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

const ProductList: React.FC = () => {
    const { t } = useLanguage();
    const { categoryId } = useParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState('id');
    const [order, setOrder] = useState('asc');
    const [isSortOpen, setIsSortOpen] = useState(false);

    const sortOptions = [
        { label: 'Featured', sort: 'id', order: 'asc' },
        { label: 'Price: Low to High', sort: 'sellingPrice', order: 'asc' },
        { label: 'Price: High to Low', sort: 'sellingPrice', order: 'desc' },
        { label: 'Top Rated', sort: 'averageRating', order: 'desc' },
        { label: 'Newest', sort: 'createdAt', order: 'desc' },
    ];

    useEffect(() => {
        setLoading(true);
        setError(null);

        const fetchData = async () => {
            try {
                const [allCats, productsData] = await Promise.all([
                    getCategories(),
                    getProducts(categoryId ? Number(categoryId) : undefined, sortBy, order)
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
    }, [categoryId, sortBy, order]);

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
                    <div className="mb-8 text-center">
                        <span className="text-secondary font-black uppercase tracking-widest text-xs mb-2 block">{t('categories')}</span>
                        <h1 className="text-4xl md:text-5xl font-black text-primary font-serif mb-4">{category.name}</h1>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">{category.description}</p>
                    </div>
                )}

                {/* Sort Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Showing</span>
                        <span className="text-sm font-bold text-gray-900">{products.length} {products.length === 1 ? 'Product' : 'Products'}</span>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="flex items-center gap-3 bg-white border border-gray-100 px-6 py-3 rounded-2xl shadow-sm hover:border-primary transition-all group"
                        >
                            <SlidersHorizontal className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                            <span className="text-xs font-black uppercase tracking-widest text-gray-900">
                                {sortOptions.find(o => o.sort === sortBy && o.order === order)?.label}
                            </span>
                            <ChevronDown className={clsx("h-4 w-4 text-gray-400 transition-transform duration-300", isSortOpen && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                            {isSortOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-3xl shadow-2xl p-2 z-50 overflow-hidden"
                                >
                                    {sortOptions.map((opt) => (
                                        <button
                                            key={`${opt.sort}-${opt.order}`}
                                            onClick={() => {
                                                setSortBy(opt.sort);
                                                setOrder(opt.order);
                                                setIsSortOpen(false);
                                            }}
                                            className={clsx(
                                                "w-full text-left px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                sortBy === opt.sort && order === opt.order
                                                    ? "bg-primary/5 text-primary"
                                                    : "text-gray-500 hover:bg-gray-50"
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {products.length === 0 ? (
                    <EmptyState
                        icon={SearchX}
                        title="No products found"
                        description="We couldn't find any products in this category."
                        actionLabel="Browse All"
                        actionPath="/"
                    />
                ) : (
                    <div
                        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8"
                    >
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
