import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Utensils, MessageCircle, DollarSign, Upload, Search, CheckCircle, ArrowRight, X } from 'lucide-react';
import { getProducts } from '../services/ProductService';
import { createCustomOrder, negotiateCustomOrder, acceptCustomOrder } from '../services/CustomOrderService';
import type { Product } from '../types/catalog.types';
import type { CustomOrderResponse } from '../types/customOrder.types';
import api from '../services/api';
import { useSSE } from '../hooks/useSSE';

const PAYMENT_MODE_LABELS: Record<string, string> = {
    'ONLINE': 'Full Payment Online',
    'COD_50': '50% Downpayment (COD)',
    'COD_100': '100% COD (Full)',
    // Backwards compatibility for raw strings
    'Full Payment Online': 'Full Payment Online',
    '50% Downpayment (COD)': '50% Downpayment (COD)',
    '100% COD': '100% COD (Full)'
};

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

    const [activeTab, setActiveTab] = useState<'request' | 'history'>('request');
    const [myRequests, setMyRequests] = useState<CustomOrderResponse[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const [negotiateModal, setNegotiateModal] = useState<{ id: number, note: string } | null>(null);
    const [acceptModal, setAcceptModal] = useState<{ id: number, note: string, paymentMode: string } | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        getProducts().then(setProducts).catch(console.error);
        fetchMyRequests();
    }, []);

    const fetchMyRequests = async () => {
        setLoadingHistory(true);
        try {
            const res = await api.get('/custom-orders/my');
            setMyRequests(res.data);
        } catch (err) {
            console.error('Failed to fetch my custom requests');
        } finally {
            setLoadingHistory(false);
        }
    };

    // ────────────────────────────────────────────────────────────────────
    // Object Real-time Sync
    // ────────────────────────────────────────────────────────────────────
    const { events: sseEvents } = useSSE(['CUSTOM_ORDER_UPDATED']);

    useEffect(() => {
        if (sseEvents['CUSTOM_ORDER_UPDATED']) {
            const updated = sseEvents['CUSTOM_ORDER_UPDATED'];
            setMyRequests(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
        }
    }, [sseEvents['CUSTOM_ORDER_UPDATED']]);

    const handleTabSwitch = (tab: 'request' | 'history') => {
        setActiveTab(tab);
        if (tab === 'history') fetchMyRequests();
    };

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
            fetchMyRequests(); // Refresh history
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit. Please log in first.');
        } finally {
            setLoading(false);
        }
    };

    const handleNegotiateSubmit = async () => {
        if (!negotiateModal || !negotiateModal.note.trim()) return;
        setActionLoading(true);
        try {
            await negotiateCustomOrder(negotiateModal.id, negotiateModal.note);
            setNegotiateModal(null);
            fetchMyRequests();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAcceptSubmit = async () => {
        if (!acceptModal || !acceptModal.paymentMode) return;
        setActionLoading(true);
        try {
            await acceptCustomOrder(acceptModal.id, acceptModal.paymentMode, acceptModal.note);
            setAcceptModal(null);
            fetchMyRequests();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <SEO
                title="Custom Orders – Mrs. Deore Premix | Personalized Traditional Products"
                description="Request a custom traditional premix or bulk package tailored to your needs. Custom ingredient ratios, branded packaging, and quality guaranteed."
                url="https://mrs-deores.onrender.com/custom-order"
            />

            <div className="flex justify-center mb-8">
                <div className="bg-gray-100 p-1.5 rounded-2xl flex items-center gap-2">
                    <button
                        onClick={() => handleTabSwitch('request')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'request' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        New Request
                    </button>
                    <button
                        onClick={() => handleTabSwitch('history')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        My Requests ({myRequests.length})
                    </button>
                </div>
            </div>

            {activeTab === 'request' ? (
                <>
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
                                <button
                                    onClick={() => handleTabSwitch('history')}
                                    className="px-8 py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-accent transition-all"
                                >
                                    View My Requests
                                </button>
                            </div>
                        </motion.div>
                    )}
                </>
            ) : (
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-primary/5 border border-gray-100">
                    <h2 className="text-2xl font-black text-gray-900 font-serif mb-8">My Custom Requests</h2>

                    {loadingHistory ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        </div>
                    ) : myRequests.length === 0 ? (
                        <div className="text-center py-20">
                            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">You haven't made any custom requests yet.</p>
                            <button
                                onClick={() => handleTabSwitch('request')}
                                className="mt-6 text-primary font-bold text-sm hover:underline"
                            >
                                Start a New Request
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {myRequests.map(order => (
                                <div key={order.id} className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-all">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900">{order.itemName}</h3>
                                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full 
                                                    ${order.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                            order.status === 'QUOTED' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-primary/10 text-primary'}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">{order.description}</p>
                                        </div>
                                        <div className="flex flex-col gap-2 w-full md:w-auto mt-4 md:mt-0 items-end">
                                            <div className="text-right">
                                                <p className="text-[10px] items-end font-black uppercase text-gray-400">Qty: {order.quantity}</p>
                                                {order.agreedPrice ? (
                                                    <p className="font-bold text-primary mt-1">₹{order.agreedPrice.toLocaleString()}</p>
                                                ) : (
                                                    <p className="text-sm text-gray-500 mt-1">Budget: ₹{order.budget.toLocaleString()}</p>
                                                )}
                                            </div>
                                            {order.status === 'QUOTED' && (
                                                <div className="flex gap-2 shrink-0 mt-3 md:mt-1">
                                                    <button
                                                        onClick={() => setNegotiateModal({ id: order.id, note: '' })}
                                                        className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl text-xs font-bold hover:bg-yellow-200 transition-colors"
                                                    >
                                                        Negotiate
                                                    </button>
                                                    <button
                                                        onClick={() => setAcceptModal({ id: order.id, note: '', paymentMode: '' })}
                                                        className="px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-colors"
                                                    >
                                                        Accept Quote
                                                    </button>
                                                </div>
                                            )}
                                            {order.status === 'APPROVED' && (
                                                <div className="flex gap-2 shrink-0 mt-3 md:mt-1">
                                                    <button
                                                        onClick={() => setAcceptModal({ id: order.id, note: '', paymentMode: '' })}
                                                        className="px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                                                    >
                                                        Proceed to Payment
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {order.adminNote && (
                                        <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-600 mb-1">Message from Admin</p>
                                            <p className="text-sm text-yellow-800">{order.adminNote}</p>
                                        </div>
                                    )}
                                    {(order.customerNote || order.paymentMode) && ['NEGOTIATING', 'ACCEPTED_BY_CUSTOMER', 'PAYMENT_PENDING', 'APPROVED'].includes(order.status) && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Your Reply</p>
                                            {order.customerNote && <p className="text-sm text-gray-800">{order.customerNote}</p>}
                                            {order.paymentMode && (
                                                <p className="mt-2 text-xs font-bold text-primary">
                                                    Preffered Payment: {PAYMENT_MODE_LABELS[order.paymentMode] || order.paymentMode}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Negotiate Modal */}
            <AnimatePresence>
                {negotiateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setNegotiateModal(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-gray-900">Negotiate Quote</h3>
                                <button onClick={() => setNegotiateModal(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                    <X className="h-5 w-5 text-gray-400" />
                                </button>
                            </div>
                            <div className="space-y-4 mb-6">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Your Note to Admin</label>
                                <textarea
                                    value={negotiateModal.note}
                                    onChange={(e) => setNegotiateModal({ ...negotiateModal, note: e.target.value })}
                                    rows={4}
                                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                                    placeholder="e.g. Can we do this for ₹500 instead?"
                                />
                            </div>
                            <button
                                onClick={handleNegotiateSubmit}
                                disabled={actionLoading || !negotiateModal.note.trim()}
                                className="w-full py-4 bg-yellow-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-yellow-600 transition-all disabled:opacity-50"
                            >
                                {actionLoading ? 'Sending...' : 'Send Message'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Accept Modal */}
            <AnimatePresence>
                {acceptModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setAcceptModal(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-gray-900">Accept Request</h3>
                                <button onClick={() => setAcceptModal(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                    <X className="h-5 w-5 text-gray-400" />
                                </button>
                            </div>
                            <div className="space-y-4 mb-4">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Payment Preference</label>
                                <select
                                    value={acceptModal.paymentMode}
                                    onChange={(e) => setAcceptModal({ ...acceptModal, paymentMode: e.target.value })}
                                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="">Select an option</option>
                                    <option value="ONLINE">Full Payment Online</option>
                                    <option value="COD_50">50% Downpayment (COD)</option>
                                    <option value="COD_100">100% COD (Full)</option>
                                </select>
                            </div>
                            <div className="space-y-4 mb-6">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Add a Note (Optional)</label>
                                <textarea
                                    value={acceptModal.note}
                                    onChange={(e) => setAcceptModal({ ...acceptModal, note: e.target.value })}
                                    rows={2}
                                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                                    placeholder="..."
                                />
                            </div>
                            <button
                                onClick={handleAcceptSubmit}
                                disabled={actionLoading || !acceptModal.paymentMode}
                                className="w-full py-4 bg-green-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-green-600 transition-all disabled:opacity-50"
                            >
                                {actionLoading ? 'Processing...' : 'Confirm Acceptance'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomOrderPage;
