import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import type { Product, Category } from "../types/catalog.types";
import ProductCard from "./ProductCard";

const ProductList: React.FC = () => {
    const { categoryId } = useParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Fetch Category Info
        api.get(`categories`).then(res => {
            const cat = res.data.find((c: Category) => c.id === Number(categoryId));
            setCategory(cat);
        });

        // Fetch Products for Category
        api.get(`products?categoryId=${categoryId}`).then(
            (response) => {
                setProducts(response.data);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching products:", error);
                setLoading(false);
            }
        );
    }, [categoryId]);

    if (loading) return <div className="text-center py-20">Gathering traditional delights...</div>;

    return (
        <div className="bg-white min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {category && (
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 font-serif mb-4">{category.name}</h1>
                        <p className="text-lg text-gray-600 max-w-3xl">{category.description}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductList;
