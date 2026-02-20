import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types/catalog.types";
import { Heart, Plus } from "lucide-react";
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

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleItem(product);
    };

    return (
        <motion.div
            layout
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative bg-white rounded-[2.5rem] flex flex-col overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
        >
            <div className="aspect-[3/4] overflow-hidden relative bg-neutral-light">
                <Link to={`/product/${product.id}`} className="block h-full relative">
                    <div className="absolute inset-0 bg-neutral-light/50" />
                    <ImageWithFallback
                        src={product.images && product.images.length > 0 ? product.images[0].imageUrl : "https://placehold.co/600x400?text=No+Image"}
                        alt={product.name}
                        className="w-full h-full object-center object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                </Link>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.bulkPrice && (
                        <div className="bg-secondary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                            Bulk Deal
                        </div>
                    )}
                    {product.stockQuantity < 10 && product.stockQuantity > 0 && (
                        <div className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                            Low Stock
                        </div>
                    )}
                </div>

                <div className="absolute top-4 right-4 z-20">
                    <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={handleWishlist}
                        className={clsx(
                            "h-10 w-10 rounded-full flex items-center justify-center shadow-lg transition-colors border backdrop-blur-md",
                            isWishlisted
                                ? "bg-red-500 border-red-500 text-white"
                                : "bg-white/80 border-gray-100 text-gray-400 hover:text-red-500"
                        )}
                    >
                        <Heart className={clsx("h-5 w-5", isWishlisted && "fill-current")} />
                    </motion.button>
                </div>

                {/* Quick Add Button Layout */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.button
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            onClick={handleAddToCart}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-accent transition-colors"
                        >
                            <Plus className="h-4 w-4" /> Quick Add
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            <div className="p-8 flex flex-col flex-grow text-center">
                <div className="mb-4">
                    <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black block mb-2">{product.category.name}</span>
                    <Link to={`/product/${product.id}`} className="block">
                        <h2 className="text-xl font-black text-gray-900 font-serif leading-tight group-hover:text-primary transition-colors">
                            {product.name}
                        </h2>
                    </Link>
                </div>

                <div className="mt-auto flex flex-col items-center">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-primary">₹{product.sellingPrice}</span>
                        {product.mrp > product.sellingPrice && (
                            <span className="text-sm text-gray-300 line-through font-bold">₹{product.mrp}</span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
