import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Utensils, MessageCircle, DollarSign, Upload, Search, CheckCircle, ArrowRight } from 'lucide-react';
import { getProducts } from '../services/ProductService';
import { createCustomOrder } from '../services/CustomOrderService';
import type { Product } from '../types/catalog.types';

const CustomOrderPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const [formData, setFormData] = useState({
        itemName: "",
        description: "",
        quantity: "",
        budget: "",
    });

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getProducts().then(setProducts).catch(console.error);
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await createCustomOrder({
                itemName: formData.itemName,
                description: formData.description,
                quantity: parseInt(formData.quantity) || 1,
                budget: parseFloat(formData.budget) || 0,
                referenceProduct: selectedProduct ? { id: selectedProduct.id } : undefined,
            });
            setSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit. Please log in first.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="text-center mb-12">
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-primary font-black uppercase tracking-[0.3em] text-[10px]"
                >
                    Premium Personalization
                </motion.span>
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-black text-gray-900 mt-2 font-serif"
                >
                    Custom <span className="text-primary italic">Orders</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-500 mt-4 max-w-xl mx-auto"
                >
                    Can't find what you're looking for? Request a custom traditional premix or bulk package tailored to your needs.
                </motion.p>
            </div>

            {!submitted ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <motion.form
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onSubmit={handleSubmit}
                            className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-primary/5 border border-gray-100 space-y-6"
                        >
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Item Name</label>
                                    <div className="relative group">
                                        <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-background border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                            placeholder="e.g. Special Wedding Masala"
                                            value={formData.itemName}
                                            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Quantity</label>
                                    <div className="relative group">
                                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="number"
                                            required
                                            className="w-full bg-background border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                            placeholder="e.g. 100 Units"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description & Special Instructions</label>
                                <div className="relative group">
                                    <MessageCircle className="absolute left-4 top-6 h-4 w-4 text-gray-300 group-focus-within:text-primary transition-colors" />
                                    <textarea
                                        required
                                        rows={4}
                                        className="w-full bg-background border-none rounded-3xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                                        placeholder="Tell us about the flavour profile, ingredients, or occasion..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Target Budget</label>
                                    <div className="relative group">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="number"
                                            required
                                            className="w-full bg-background border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                            placeholder="Estimated Budget"
                                            value={formData.budget}
                                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Reference Product (Optional)</label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                                        <input
                                            type="text"
                                            className="w-full bg-background border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                            placeholder="Search existing products..."
                                            value={selectedProduct ? selectedProduct.name : searchTerm}
                                            onFocus={() => setShowProductDropdown(true)}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setSelectedProduct(null);
                                            }}
                                        />
                                        <AnimatePresence>
                                            {showProductDropdown && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute z-10 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto"
                                                >
                                                    {filteredProducts.length > 0 ? filteredProducts.map(product => (
                                                        <button
                                                            key={product.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedProduct(product);
                                                                setShowProductDropdown(false);
                                                            }}
                                                            className="w-full text-left px-4 py-3 text-sm hover:bg-background transition-colors flex items-center justify-between group"
                                                        >
                                                            <span>{product.name}</span>
                                                            <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </button>
                                                    )) : (
                                                        <div className="px-4 py-3 text-xs text-gray-400">No products found</div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-primary text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-accent hover:-translate-y-1 transition-all duration-300"
                            >
                                {loading ? "SENDING REQUEST..." : "SUBMIT CUSTOM REQUEST"}
                            </button>
                        </motion.form>
                    </div>

                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-secondary/5 rounded-[2.5rem] p-8 border border-secondary/10"
                        >
                            <h3 className="text-xl font-black text-gray-900 font-serif">Bulk Benefits</h3>
                            <ul className="mt-6 space-y-4">
                                {[
                                    "Custom Ingredient Ratios",
                                    "Branded Packaging Options",
                                    "Tiered Pricing for Large Volume",
                                    "Dedicated Account Manager",
                                    "Quality Assurance Guarantee"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                        <CheckCircle className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10 flex flex-col items-center text-center"
                        >
                            <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                <Upload className="h-6 w-6 text-primary" />
                            </div>
                            <h4 className="font-black text-gray-900">Reference Image</h4>
                            <p className="text-xs text-gray-500 mt-2">Have a photo of what you want? Upload it after submission.</p>
                        </motion.div>
                    </div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[3rem] p-16 text-center shadow-2xl border border-gray-100 max-w-2xl mx-auto"
                >
                    <div className="h-24 w-24 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle className="h-12 w-12" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 font-serif lowercase italic">Request Received</h2>
                    <p className="text-gray-500 mt-4 leading-relaxed">
                        Thank you for your interest! Our traditional masters will review your request and get back to you within <span className="text-primary font-bold">24-48 hours</span> with a quote.
                    </p>
                    <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center">
                        <button
                            onClick={() => {
                                setSubmitted(false);
                                setFormData({ itemName: '', description: '', quantity: '', budget: '' });
                                setSelectedProduct(null);
                                setSearchTerm('');
                            }}
                            className="px-8 py-4 bg-background text-gray-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-colors"
                        >
                            New Request
                        </button>
                        <a
                            href="/my-orders"
                            className="px-8 py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-accent transition-all"
                        >
                            View My Requests
                        </a>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default CustomOrderPage;
