import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ShoppingBag, Clock, CheckCircle2, Truck, Package, AlertTriangle, ArrowLeft, ChevronRight
} from 'lucide-react';
import { getUserOrders } from '../services/OrderService';
import type { Order } from '../types/Order';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
    CREATED: { label: 'Order Placed', color: 'text-blue-700', bg: 'bg-blue-100', icon: ShoppingBag },
    PENDING: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Clock },
    MOCK_PAID: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle2 },
    PAID: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle2 },
    SHIPPED: { label: 'Shipped', color: 'text-indigo-700', bg: 'bg-indigo-100', icon: Truck },
    DELIVERED: { label: 'Delivered', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle2 },
    CANCELLED: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-100', icon: AlertTriangle },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const cfg = STATUS_CONFIG[status?.toUpperCase()] || { label: status, color: 'text-gray-700', bg: 'bg-gray-100', icon: Package };
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.color} ${cfg.bg}`}>
            <Icon className="h-3 w-3" />
            {cfg.label}
        </span>
    );
};

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getUserOrders()
            .then(setOrders)
            .catch(() => setError('Could not load orders. Please try again.'))
            .finally(() => setLoading(false));
    }, []);

    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
    const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 120 } } };

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            {/* Header */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
                <Link to="/" className="inline-flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:text-accent transition-colors mb-4">
                    <ArrowLeft className="h-3 w-3" /> Back to Store
                </Link>
                <h1 className="text-3xl font-black text-gray-900 font-serif">My Orders</h1>
                <p className="text-sm text-gray-400 mt-1">{!loading && !error ? `${orders.length} order${orders.length !== 1 ? 's' : ''} total` : ''}</p>
            </motion.div>

            {/* Loading skeleton */}
            {loading && (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
                            <div className="h-3 bg-gray-100 rounded w-1/3" />
                        </div>
                    ))}
                </div>
            )}

            {/* Error state */}
            {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
                    <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
                    <p className="text-red-700 font-bold">{error}</p>
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && orders.length === 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
                    <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-5">
                        <ShoppingBag className="h-10 w-10 text-primary/40" />
                    </div>
                    <h2 className="text-xl font-black text-gray-700 font-serif">No Orders Yet</h2>
                    <p className="text-gray-400 text-sm mt-2 mb-6">Your order history will appear here once you place your first order.</p>
                    <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-accent transition-all shadow-lg shadow-primary/20">
                        Start Shopping <ChevronRight className="h-4 w-4" />
                    </Link>
                </motion.div>
            )}

            {/* Order list */}
            {!loading && !error && orders.length > 0 && (
                <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                    {[...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => (
                        <motion.div
                            key={order.id}
                            variants={item}
                            whileHover={{ y: -2 }}
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                        >
                            {/* Order header */}
                            <div className="px-6 pt-5 pb-4 flex items-center justify-between gap-4 flex-wrap">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order</span>
                                        <span className="text-sm font-black text-gray-900">#{order.id}</span>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        {' · '}
                                        {order.totalItems} item{order.totalItems !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={order.status} />
                                    <span className="text-lg font-black text-gray-900">₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            {/* Order items */}
                            {order.orderItems && order.orderItems.length > 0 && (
                                <div className="border-t border-gray-50 px-6 py-4 space-y-3">
                                    {order.orderItems.map(oi => (
                                        <div key={oi.id} className="flex items-center gap-3">
                                            {oi.product?.images?.find(img => img.isPrimary)?.imageUrl ? (
                                                <img src={oi.product.images.find(img => img.isPrimary)?.imageUrl} alt={oi.product.name} className="h-12 w-12 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                                            ) : (
                                                <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                                                    <Package className="h-5 w-5 text-primary/30" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{oi.product?.name || 'Product'}</p>
                                                <p className="text-xs text-gray-400">Qty: {oi.quantity} · ₹{Number(oi.priceAtPurchase).toLocaleString('en-IN')} each</p>
                                            </div>
                                            <p className="text-sm font-black text-gray-900 flex-shrink-0">
                                                ₹{(oi.quantity * oi.priceAtPurchase).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Order footer */}
                            {order.shippingAddress && (
                                <div className="border-t border-gray-50 px-6 py-3 bg-gray-50/40">
                                    <p className="text-xs text-gray-400">
                                        📍 {[order.shippingAddress.streetAddress, order.shippingAddress.city, order.shippingAddress.state].filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default Orders;
