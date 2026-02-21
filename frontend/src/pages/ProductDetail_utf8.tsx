import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, ArrowLeft, Star, ShoppingBag, Truck, ShieldCheck,
    Share2, Heart, Plus, Minus, CheckCircle2, AlertTriangle, Package
} from 'lucide-react';
import type { Product } from '../types/catalog.types';
import api from '../services/api';
import useCartStore from '../store/useCartStore';
import ReviewSection from '../components/ReviewSection';
import ProductCard from '../components/ProductCard';
import FAQSection from '../components/FAQSection';

const pdpFAQs = [
    {
        question: "How do I ensure the best taste from this premix?",
        answer: "Detailed cooking instructions are provided on the packaging. Generally, using fresh ghee and following the water-to-premix ratio accurately ensures the most authentic taste."
    },
    {
        question: "Is this product suitable for children and seniors?",
        answer: "Yes! Since we use natural ingredients and no chemical additives, our products are safe and healthy for family members of all ages."
    },
    {
        question: "Can I get a discount for buying in bulk?",
        answer: "Yes, we offer 'Blessing' tiers for bulk purchases. Check the wholesale pricing section above the product description for unit-price breaks."
    },
    {
        question: "What if the seal is broken on delivery?",
        answer: "Your safety is our priority. If you receive a damaged package or broken seal, reach out to us on WhatsApp within 24 hours with a photo, and we will ship a replacement immediately."
    }
];

interface ProductDetailProps {
    currentUser?: any;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ currentUser }) => {
    const { id } = useParams<{ id: string }>();
    const addItem = useCartStore(state => state.addItem);

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/products/${id}`);
                setProduct(response.data);
            } catch (err) {
                console.error("Failed to load product", err);
                setError("Product not found or unavailable.");
            } finally {
                setLoading(false);
            }
        };

        const fetchRelated = async () => {
            try {
                const relatedRes = await api.get(`/products/${id}/related`);
                setRelatedProducts(relatedRes.data);
            } catch (err) {
                console.error("Failed to load related products", err);
                // Do not set global error; just fail silently for related reel
            }
        };

        if (id) {
            fetchProduct();
            fetchRelated();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 bg-neutral-light dark:bg-neutral-900 flex justify-center">
                <div className="flex flex-col items-center gap-4 animate-pulse mt-20">
                    <div className="h-12 w-12 bg-primary/20 rounded-full"></div>
                    <div className="h-4 w-48 bg-gray-200 dark:bg-neutral-800 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen pt-32 pb-12 bg-neutral-light dark:bg-neutral-900 text-center px-4">
                <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-6" />
                <h1 className="text-3xl font-black text-gray-900 dark:text-white font-serif mb-4">Product Not Found</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">{error}</p>
                <Link to="/" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-accent transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Store
                </Link>
            </div>
        );
    }

    const images = product.images && product.images.length > 0
        ? [...product.images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
        : [];

    const activeImageUrl = images[activeImageIndex]?.imageUrl || 'https://placehold.co/600x600?text=No+Image';

    const renderStockStatus = () => {
        if (product.stockQuantity > 10) return <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-bold bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full w-fit"><CheckCircle2 className="h-4 w-4" /> In Stock</span>;
        if (product.stockQuantity > 0) return <span className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400 text-sm font-bold bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full w-fit"><AlertTriangle className="h-4 w-4" /> Only {product.stockQuantity} left</span>;
        return <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-sm font-bold bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full w-fit"><Package className="h-4 w-4" /> Out of Stock</span>;
    };

    const handleAddToCart = () => {
        if (product.stockQuantity < 1) return;
        setAddingToCart(true);
        addItem(product, quantity);
        setTimeout(() => setAddingToCart(false), 600);
    };

    const currentPrice = (product.bulkPrice && product.bulkMinQuantity && quantity >= product.bulkMinQuantity)
        ? product.bulkPrice
        : product.sellingPrice;

    const bulkDifference = product.bulkMinQuantity ? product.bulkMinQuantity - quantity : 0;
    const showBulkReminder = product.bulkPrice && bulkDifference > 0 && bulkDifference <= 5;

    return (
        <div className="bg-neutral-light dark:bg-neutral-900 min-h-screen pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-8">
                    <Link to="/" className="hover:text-primary dark:hover:text-primary-light transition-colors">Home</Link>
                    <ChevronRight className="h-3 w-3" />
                    <Link to={`/category/${product.category.id}`} className="hover:text-primary dark:hover:text-primary-light transition-colors">{product.category.name}</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-gray-900 dark:text-gray-200 line-clamp-1 max-w-[200px]">{product.name}</span>
                </nav>

                <div className="bg-white dark:bg-neutral-800 rounded-[2.5rem] border border-gray-100 dark:border-neutral-700 shadow-sm overflow-hidden flex flex-col lg:flex-row">

                    {/* Left: Image Gallery */}
                    <div className="lg:w-1/2 p-4 lg:p-8 flex flex-col gap-4 bg-gray-50/50 dark:bg-neutral-800/50">
                        <motion.div
                            className="aspect-square rounded-3xl overflow-hidden bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-700 relative group cursor-zoom-in"
                            layoutId={`product-image-${product.id}`}
                        >
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={activeImageIndex}
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    src={activeImageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </AnimatePresence>

                            {product.mrp > product.sellingPrice && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                                    {Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)}% OFF
                                </div>
                            )}

                            <button
                                onClick={(e) => { e.preventDefault(); setIsWishlisted(!isWishlisted); }}
                                className="absolute top-4 right-4 h-12 w-12 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center shadow-md text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            >
                                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''} transition-colors duration-300`} />
                            </button>
                        </motion.div>

                        <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
                            {images.map((img, idx) => (
                                <button
                                    key={img.id}
                                    onClick={() => setActiveImageIndex(idx)}
                                    className={`h-20 w-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer snap-center ${activeImageIndex === idx
                                        ? 'border-primary ring-2 ring-primary/20'
                                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover bg-white dark:bg-neutral-800" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Details */}
                    <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col relative">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <Link to={`/category/${product.category.id}`} className="text-sm font-black text-secondary uppercase tracking-widest hover:text-accent transition-colors mb-2 block">
                                    {product.category.name}
                                </Link>
                                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white font-serif leading-tight">
                                    {product.name}
                                </h1>
                            </div>
                            <button className="h-10 w-10 bg-gray-50 dark:bg-neutral-700/50 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-primary hover:text-white transition-all">
                                <Share2 className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Reviews summary placeholder */}
                        <div className="flex items-center gap-2 mb-6">
                            <div className="flex text-yellow-400">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}
                            </div>
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">4.9 (128 reviews)</span>
                        </div>

                        <div className="mb-6 flex items-end gap-3">
                            <span className="text-4xl font-black text-gray-900 dark:text-white font-serif">₹{currentPrice.toLocaleString('en-IN')}</span>
                            {product.mrp > product.sellingPrice && (
                                <span className="text-xl text-gray-400 line-through font-medium mb-1">₹{product.mrp.toLocaleString('en-IN')}</span>
                            )}
                        </div>

                        {product.bulkMinQuantity && product.bulkPrice && (
                            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 rounded-2xl p-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 bg-primary/20 p-1.5 rounded-full"><Package className="h-4 w-4 text-primary" /></div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">Wholesale Pricing Available</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Buy <span className="font-black text-primary">{product.bulkMinQuantity}+</span> units at <span className="font-black text-primary">₹{product.bulkPrice}/each</span></p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showBulkReminder && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-secondary/5 dark:bg-secondary/10 border border-dashed border-secondary/30 rounded-2xl p-4 mb-8 flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 bg-secondary rounded-full animate-pulse" />
                                    <p className="text-xs font-bold text-secondary">
                                        Add {bulkDifference} more to unlock wholesale pricing!
                                    </p>
                                </div>
                                <button
                                    onClick={() => setQuantity(product.bulkMinQuantity!)}
                                    className="text-[10px] font-black uppercase tracking-widest text-secondary hover:underline"
                                >
                                    Apply Now
                                </button>
                            </motion.div>
                        )}

                        <div className="prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-400 mb-8 whitespace-pre-wrap leading-relaxed">
                            {product.description}
                        </div>

                        <div className="mb-8">
                            {renderStockStatus()}
                        </div>

                        {/* Action Area */}
                        <div className="mt-auto space-y-4">
                            {product.stockQuantity > 0 ? (
                                <div className="flex gap-4 items-center">
                                    <div className="flex items-center bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl h-14 p-1">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="h-full px-4 text-gray-500 hover:bg-white dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="w-10 text-center font-black text-gray-900 dark:text-white text-lg">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                                            className="h-full px-4 text-gray-500 hover:bg-white dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleAddToCart}
                                        disabled={addingToCart}
                                        className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${addingToCart
                                            ? 'bg-green-500 text-white cursor-not-allowed'
                                            : 'bg-primary text-white hover:bg-accent shadow-lg shadow-primary/20'
                                            }`}
                                    >
                                        <AnimatePresence mode="wait">
                                            {addingToCart ? (
                                                <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-5 w-5" /> Added
                                                </motion.div>
                                            ) : (
                                                <motion.div key="default" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                                                    <ShoppingBag className="h-5 w-5" /> Add to Cart
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                </div>
                            ) : (
                                <button disabled className="w-full h-14 bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-gray-600 rounded-2xl font-black text-sm uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2">
                                    <AlertTriangle className="h-5 w-5" /> Out of Stock
                                </button>
                            )}
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-neutral-700">
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <Truck className="h-5 w-5 text-gray-400" />
                                <span className="font-medium">Fast Nationwide Delivery</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <ShieldCheck className="h-5 w-5 text-gray-400" />
                                <span className="font-medium">Secure Encrypted Checkout</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-32 pt-24 border-t border-gray-100 dark:border-neutral-800">
                        <div className="text-center mb-16">
                            <span className="text-secondary font-black uppercase tracking-[0.2em] text-[10px] block mb-4">Complete your Taste</span>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white font-serif tracking-tight">Related Traditions</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {relatedProducts.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}

                {/* FAQ Section */}
                <div className="mt-24">
                    <FAQSection
                        items={pdpFAQs}
                        title="Common Questions"
                        subtitle="Detailed insights into our handmade traditions."
                    />
                </div>

                {/* Reviews & Ratings Section */}
                {product && (
                    <ReviewSection productId={product.id} currentUser={currentUser} />
                )}
            </div>
        </div>
    );
};

export default ProductDetail;

