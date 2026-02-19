import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import type { Product } from "../types/catalog.types";
import { Heart, ShoppingCart } from "lucide-react";
import useCartStore from "../store/useCartStore";
import useWishlistStore from "../store/useWishlistStore";
import { clsx } from "clsx";

const ProductDetail: React.FC = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState("");

    const { addItem } = useCartStore();
    const { toggleItem, isInWishlist } = useWishlistStore();

    const isWishlisted = product ? isInWishlist(product.id) : false;

    const handleAddToCart = () => {
        if (product) addItem(product);
    };

    const handleWishlist = () => {
        if (product) toggleItem(product);
    };

    useEffect(() => {
        api.get(`products/${productId}`).then(
            (response) => {
                setProduct(response.data);
                setSelectedImage(response.data.images.find((img: any) => img.isPrimary)?.imageUrl || "");
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching product:", error);
                setLoading(false);
            }
        );
    }, [productId]);

    if (loading) return <div className="text-center py-20">Loading product details...</div>;
    if (!product) return <div className="text-center py-20">Product not found.</div>;

    const discount = Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100);

    return (
        <div className="bg-white min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-w-1 aspect-h-1 rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
                            <img
                                src={selectedImage}
                                alt={product.name}
                                className="w-full h-96 object-center object-cover"
                            />
                        </div>
                        <div className="flex gap-4">
                            {product.images.map((img) => (
                                <button
                                    key={img.id}
                                    onClick={() => setSelectedImage(img.imageUrl)}
                                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img.imageUrl ? "border-primary shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                                        }`}
                                >
                                    <img src={img.imageUrl} alt="preview" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-6">
                        <nav className="text-sm font-medium text-gray-500 uppercase tracking-widest">
                            {product.category.name}
                        </nav>
                        <h1 className="text-4xl font-bold text-gray-900 font-serif">{product.name}</h1>

                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-bold text-primary">₹{product.sellingPrice}</span>
                            <span className="text-xl text-gray-400 line-through">₹{product.mrp}</span>
                            <span className="bg-accent text-white px-4 py-1 rounded-full text-sm font-bold">
                                {discount}% OFF
                            </span>
                        </div>

                        <p className="text-lg text-gray-700 leading-relaxed">
                            {product.description}
                        </p>

                        {/* Bulk Offer Card */}
                        {product.bulkPrice && (
                            <div className="bg-secondary/10 border-2 border-secondary/20 rounded-2xl p-6">
                                <h3 className="font-bold text-accent mb-2">🎁 BULK OFFER</h3>
                                <p className="text-sm text-gray-600">
                                    Buy <span className="font-bold text-gray-900">{product.bulkMinQuantity}+ units</span> at only <span className="text-xl font-bold text-primary italic">₹{product.bulkPrice}</span> per unit!
                                </p>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={handleWishlist}
                                className={clsx("flex-none w-14 h-14 flex items-center justify-center border-2 border-gray-200 rounded-xl transition-all hover:border-gray-300", isWishlisted ? "text-red-500 bg-red-50 border-red-200" : "text-gray-400")}
                            >
                                <Heart className={clsx("h-6 w-6", isWishlisted && "fill-current")} />
                            </button>

                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-primary hover:bg-secondary text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                Add to Cart
                            </button>
                        </div>

                        <div className="border-t border-gray-100 pt-6 space-y-4">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="text-primary text-xl">🚚</span> Free delivery on orders above ₹499
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="text-primary text-xl">🛡️</span> Handcrafted and quality checked
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
