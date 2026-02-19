import React from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types/catalog.types";
import { Heart, ShoppingCart } from "lucide-react";
import useCartStore from "../store/useCartStore";
import useWishlistStore from "../store/useWishlistStore";
import { clsx } from 'clsx';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addItem } = useCartStore();
    const { toggleItem, isInWishlist } = useWishlistStore();
    const isWishlisted = isInWishlist(product.id);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addItem(product);
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        toggleItem(product);
    };

    return (
        <div className="group relative bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="aspect-w-3 aspect-h-4 bg-gray-200 group-hover:opacity-75 sm:aspect-none sm:h-96 relative">
                <img
                    src={product.images && product.images.length > 0 ? product.images[0].imageUrl : "https://placehold.co/600x400?text=No+Image"}
                    alt={product.name}
                    className="w-full h-full object-center object-cover sm:w-full sm:h-full"
                />

                {/* Quick Actions Overlay */}
                <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={handleWishlist}
                        className={clsx("p-2 rounded-full shadow-sm hover:bg-gray-100", isWishlisted ? "bg-red-50 text-red-500" : "bg-white text-gray-600")}
                    >
                        <Heart className={clsx("h-5 w-5", isWishlisted && "fill-current")} />
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 space-y-2 flex flex-col">
                <h3 className="text-lg font-medium text-gray-900">
                    <Link to={`/product/${product.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.name}
                    </Link>
                </h3>
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <div>
                    <h3 className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">
                        {product.category.name}
                    </h3>
                    <Link to={`/product/${product.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        <h2 className="text-xl font-bold text-gray-900 font-serif mb-2 group-hover:text-primary transition-colors">
                            {product.name}
                        </h2>
                    </Link>
                </div>
                <div className="mt-auto">
                    <div className="mt-4 flex items-center justify-between z-10 relative">
                        <span className="text-xl font-bold text-gray-900">₹{product.sellingPrice}</span>
                        <button
                            onClick={handleAddToCart}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
                        >
                            <ShoppingCart className="h-4 w-4 mr-1" /> Add
                        </button>
                    </div>
                </div>

                {/* Bulk Badge */}
                {product.bulkPrice && (
                    <div className="absolute top-0 left-0 bg-secondary text-white text-xs font-bold px-2 py-1 rounded-br-lg shadow-sm">
                        Bulk Offer
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
