import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types/catalog.types";
import { Heart, Plus, Star } from "lucide-react";
import useCartStore from "../store/useCartStore";
import useWishlistStore from "../store/useWishlistStore";
import ImageWithFallback from "./ImageWithFallback";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addItem } = useCartStore();
    const { toggleItem, isInWishlist } = useWishlistStore();
    const isWishlisted = isInWishlist(product.id);
    const [isHovered, setIsHovered] = useState(false);
    const [cartBounce, setCartBounce] = useState(false);
    const [heartPulse, setHeartPulse] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
        setCartBounce(true);
        setTimeout(() => setCartBounce(false), 500);
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleItem(product);
        setHeartPulse(true);
        setTimeout(() => setHeartPulse(false), 400);
    };

    return (
        <motion.div
            layout
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative bg-white rounded-2xl sm:rounded-[2.5rem] flex flex-col overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
        >
            <div className="aspect-[3/4] overflow-hidden relative bg-neutral-light">
                <Link to={`/product/${product.id}`} className="block h-full relative">
                    <div className="absolute inset-0 bg-neutral-light/50" />
                    <ImageWithFallback
                        src={product.images && product.images.length > 0 ? product.images[0].imageUrl : "https://placehold.co/600x400?text=No+Image"}
                        alt={product.name}
                        className="w-full h-full object-center object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                </Link>

                {/* Badges */}
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-2">
                    {product.bulkPrice && (
                        <div className="bg-secondary text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 sm:px-3 py-1 rounded-full shadow-lg">
                            Bulk Deal
                        </div>
                    )}
                    {product.stockQuantity < 10 && product.stockQuantity > 0 && (
                        <div className="bg-red-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 sm:px-3 py-1 rounded-full shadow-lg">
                            Low Stock
                        </div>
                    )}
                </div>

                {/* Wishlist Button with pulse animation */}
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20">
                    <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                        animate={heartPulse ? { scale: [1, 1.35, 1] } : {}}
                        transition={heartPulse ? { duration: 0.4 } : undefined}
                        onClick={handleWishlist}
                        className={clsx(
                            "h-10 w-10 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center shadow-lg transition-colors border backdrop-blur-md",
                            isWishlisted
                                ? "bg-red-500 border-red-500 text-white"
                                : "bg-white/80 border-gray-100 text-gray-400 hover:text-red-500"
                        )}
                    >
                        <Heart className={clsx("h-5 w-5", isWishlisted && "fill-current")} />
                    </motion.button>
                </div>

                {/* Quick Add Button — always visible on mobile with touch target, hover-only on desktop */}
                <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20">
                    {/* Mobile: always visible */}
                    <motion.button
                        animate={cartBounce ? { scale: [1, 1.15, 1] } : {}}
                        transition={cartBounce ? { duration: 0.4 } : undefined}
                        onClick={handleAddToCart}
                        className="sm:hidden bg-primary text-white px-5 py-2.5 rounded-full font-black text-[11px] uppercase tracking-wider shadow-xl flex items-center gap-1.5 hover:bg-accent transition-colors min-h-[44px]"
                    >
                        <Plus className="h-4 w-4" /> Add
                    </motion.button>
                    {/* Desktop: show on hover */}
                    <AnimatePresence>
                        {isHovered && (
                            <motion.button
                                initial={{ y: 30, opacity: 0, scale: 0.8 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: 20, opacity: 0, scale: 0.9 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                                onClick={handleAddToCart}
                                className="hidden sm:flex bg-primary text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl items-center gap-2 hover:bg-accent transition-colors"
                            >
                                <Plus className="h-4 w-4" /> Quick Add
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="p-5 sm:p-8 flex flex-col flex-grow text-center">
                <div className="mb-3 sm:mb-4">
                    <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black block mb-1.5 sm:mb-2">{product.category.name}</span>
                    <Link to={`/product/${product.id}`} className="block">
                        <h2 className="text-base sm:text-xl font-black text-gray-900 font-serif leading-tight group-hover:text-primary transition-colors line-clamp-2">
                            {product.name}
                        </h2>
                    </Link>

                    {/* Rating Summary */}
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                        <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={clsx(
                                        "h-3 w-3",
                                        i < Math.floor(product.averageRating || 5) ? "fill-current" : "text-gray-200"
                                    )}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">
                            ({product.totalReviews || 0})
                        </span>
                    </div>
                </div>

                <div className="mt-auto flex flex-col items-center">
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl sm:text-2xl font-black text-primary">₹{product.sellingPrice}</span>
                        {product.mrp > product.sellingPrice && (
                            <span className="text-xs sm:text-sm text-gray-300 line-through font-bold">₹{product.mrp}</span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div >
    );
};

export default ProductCard;
