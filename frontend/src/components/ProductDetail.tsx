import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById } from "../services/ProductService";
import type { Product } from "../types/catalog.types";
import { Heart, ShoppingBag, Plus, Minus, ArrowLeft } from "lucide-react";
import useCartStore from "../store/useCartStore";
import useWishlistStore from "../store/useWishlistStore";
import { clsx } from "clsx";
import ImageWithFallback from "./ImageWithFallback";
import BrandLogo from "./BrandLogo";

const ProductDetail: React.FC = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState("");
    const [quantity, setQuantity] = useState(1);

    const { addItem } = useCartStore();
    const { toggleItem, isInWishlist } = useWishlistStore();

    const isWishlisted = product ? isInWishlist(product.id) : false;

    useEffect(() => {
        setLoading(true);
        if (productId) {
            getProductById(Number(productId)).then(
                (data) => {
                    setProduct(data);
                    setSelectedImage(data.images?.find((img) => img.isPrimary)?.imageUrl || data.images?.[0]?.imageUrl || "");
                    setLoading(false);
                },
                (error) => {
                    console.error("Error fetching product:", error);
                    setLoading(false);
                }
            );
        }
    }, [productId]);

    const handleAddToCart = () => {
        if (product) {
            // Add item multiple times based on quantity
            // Note: Optimally, cart store should support quantity add. 
            // For now, we loop or just add once. Ideally refactor store later.
            // Let's just add once for now to be safe with current store implementation, 
            // or loop calling addItem.
            for (let i = 0; i < quantity; i++) {
                addItem(product);
            }
        }
    };

    const handleWishlist = () => {
        if (product) toggleItem(product);
    };

    if (loading) return (
        <div className="min-h-screen pt-32 pb-12 flex justify-center">
            <div className="flex flex-col items-center gap-4 animate-pulse">
                <BrandLogo className="opacity-50" />
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
            <h2 className="text-2xl font-black font-serif text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-500 mb-6">The item you're looking for seems to have vanished from our pantry.</p>
            <Link to="/" className="bg-primary text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-lg hover:bg-secondary transition-colors">
                Return to Shop
            </Link>
        </div>
    );

    const discount = product.mrp > product.sellingPrice
        ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
        : 0;

    return (
        <div className="bg-white min-h-screen py-8 lg:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb / Back */}
                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Collection
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Gallery Section */}
                    <div className="space-y-6">
                        <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-neutral-light/30 shadow-sm border border-gray-100 relative group">
                            <ImageWithFallback
                                src={selectedImage || "https://placehold.co/600x800?text=No+Image"}
                                alt={product.name}
                                className="w-full h-full object-center object-cover"
                            />
                            {/* Zoom Hint */}
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </div>

                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {product.images.map((img) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setSelectedImage(img.imageUrl)}
                                        className={clsx(
                                            "w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all p-1",
                                            selectedImage === img.imageUrl
                                                ? "border-primary shadow-md bg-white"
                                                : "border-transparent opacity-60 hover:opacity-100 hover:bg-gray-50"
                                        )}
                                    >
                                        <ImageWithFallback
                                            src={img.imageUrl}
                                            alt="preview"
                                            className="w-full h-full object-cover rounded-xl"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info Section */}
                    <div className="flex flex-col">
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                    {product.category.name}
                                </span>
                                {product.stockQuantity < 10 && (
                                    <span className="bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full animate-pulse">
                                        Only {product.stockQuantity} left
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 font-serif leading-tight mb-6">
                                {product.name}
                            </h1>

                            <div className="flex items-baseline gap-4 mb-8">
                                <span className="text-4xl font-black text-primary">₹{product.sellingPrice}</span>
                                {product.mrp > product.sellingPrice && (
                                    <>
                                        <span className="text-xl text-gray-300 line-through font-bold">₹{product.mrp}</span>
                                        <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                                            Save {discount}%
                                        </span>
                                    </>
                                )}
                            </div>

                            <p className="text-lg text-gray-600 leading-relaxed font-light">
                                {product.description}
                            </p>
                        </div>

                        {/* Quantity & Actions */}
                        <div className="mt-auto space-y-8">
                            {/* Quantity Selector */}
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Quantity</span>
                                <div className="flex items-center bg-gray-50 rounded-full border border-gray-200">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-bold text-gray-900">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-primary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-secondary hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                >
                                    <ShoppingBag className="h-5 w-5" />
                                    Add to Cart
                                </button>

                                <button
                                    onClick={handleWishlist}
                                    className={clsx(
                                        "flex-none w-16 h-16 flex items-center justify-center rounded-2xl border-2 transition-all hover:scale-105",
                                        isWishlisted
                                            ? "border-red-500 bg-red-50 text-red-500"
                                            : "border-gray-100 bg-white text-gray-300 hover:border-red-200 hover:text-red-400"
                                    )}
                                >
                                    <Heart className={clsx("h-6 w-6", isWishlisted && "fill-current")} />
                                </button>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-12 pt-8 border-t border-gray-100 grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-lg">🚚</div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-900">Fast Delivery</p>
                                    <p className="text-xs text-gray-400">Within 3-5 days</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-lg">🛡️</div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-900">Quality Assured</p>
                                    <p className="text-xs text-gray-400">Hand-picked ingredients</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
