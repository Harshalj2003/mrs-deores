import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Order } from '../types/Order';
import type { CustomOrderResponse } from '../types/customOrder.types';
import { getUserOrders } from '../services/OrderService';
import { getMyCustomOrders } from '../services/CustomOrderService';
import { CUSTOM_ORDER_STATUS_LABELS } from '../types/customOrder.types';
import { Package, FileText, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import EmptyState from '../components/EmptyState';
import OrderTimeline from '../components/OrderTimeline';

const MyOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [customOrders, setCustomOrders] = useState<CustomOrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'standard' | 'custom'>('standard');
    const navigate = useNavigate();

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchAll = async () => {
            try {
                const [orderData, customData] = await Promise.all([
                    getUserOrders(),
                    getMyCustomOrders(),
                ]);
                setOrders(orderData);
                setCustomOrders(customData);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [navigate]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-neutral-light">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <h1 className="text-3xl font-serif font-black text-brand-maroon mb-2">My Orders</h1>
                <p className="text-sm text-gray-500 mb-8">Track your regular and custom order requests</p>

                {/* Tab Switcher */}
                <div className="flex gap-2 mb-8 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 w-fit">
                    <button
                        onClick={() => setActiveTab('standard')}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'standard'
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-gray-500 hover:text-primary'
                            }`}
                    >
                        <Package className="inline h-3.5 w-3.5 mr-2 -mt-0.5" />
                        Standard ({orders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('custom')}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'custom'
                                ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                                : 'text-gray-500 hover:text-secondary'
                            }`}
                    >
                        <FileText className="inline h-3.5 w-3.5 mr-2 -mt-0.5" />
                        Custom ({customOrders.length})
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                                <div className="h-20 bg-gray-100 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'standard' ? (
                    /* Standard Orders (existing UI) */
                    !orders || orders.length === 0 ? (
                        <EmptyState
                            icon={Package}
                            title="No orders yet"
                            description="Your kitchen is waiting! Start adding delicious premixes to your collection."
                            actionLabel="Browse Products"
                            actionPath="/"
                        />
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                    <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
                                        <div className="flex space-x-8 text-sm text-gray-500">
                                            <div>
                                                <span className="block text-gray-400 text-[10px] uppercase font-black tracking-widest">Order Placed</span>
                                                <span className="text-gray-900 font-bold font-serif">{formatDate(order?.createdAt || new Date().toISOString())}</span>
                                            </div>
                                            <div>
                                                <span className="block text-gray-400 text-[10px] uppercase font-black tracking-widest">Total</span>
                                                <span className="text-gray-900 font-bold font-serif">₹{order?.totalAmount?.toFixed(2) || "0.00"}</span>
                                            </div>
                                            <div>
                                                <span className="block text-gray-400 text-[10px] uppercase font-black tracking-widest">Ship To</span>
                                                <span className="text-gray-900 font-bold font-serif hover:text-primary cursor-pointer group relative transition-colors">
                                                    {order?.shippingAddress?.fullName}
                                                    <div className="absolute hidden group-hover:block z-10 w-64 p-4 bg-white shadow-xl rounded-2xl border border-gray-100 text-xs left-0 top-6">
                                                        <p className="font-bold text-gray-900">{order?.shippingAddress?.fullName}</p>
                                                        <p className="text-gray-500 mt-1">{order?.shippingAddress?.streetAddress}</p>
                                                        <p className="text-gray-500">{order?.shippingAddress?.city}, {order?.shippingAddress?.state} {order?.shippingAddress?.zipCode}</p>
                                                    </div>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Order #{String(order?.id || "").substring(0, 8)}...</span>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="space-y-6">
                                            {order?.orderItems?.map((item) => (
                                                <div key={item.id} className="flex items-center group">
                                                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                                                        <img
                                                            src={item?.product?.images?.[0]?.imageUrl || "https://placehold.co/100"}
                                                            alt={item?.product?.name}
                                                            className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div className="ml-6 flex-1 flex flex-col">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-bold text-gray-900 font-serif text-lg">{item?.product?.name}</h4>
                                                                <p className="text-sm text-gray-500 line-clamp-1 mt-1">{item?.product?.description}</p>
                                                            </div>
                                                            <p className="font-bold text-primary font-serif text-lg">₹{item?.priceAtPurchase}</p>
                                                        </div>
                                                        <div className="mt-3 flex items-center">
                                                            <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 px-2 py-1 rounded text-gray-600">Qty: {item.quantity}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-8 border-t border-gray-100 pt-6 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2.5 w-2.5 rounded-full ${order?.status === 'DELIVERED' ? 'bg-green-500' : 'bg-primary animate-pulse'}`}></div>
                                                <span className="font-bold text-gray-900 text-sm">
                                                    {order?.status === 'MOCK_PAID' || order?.status === 'PAID' ? 'Processing Order' : order?.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    /* Custom Orders Tab */
                    customOrders.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            title="No custom requests"
                            description="Need something special? Submit a custom order request."
                            actionLabel="Create Custom Order"
                            actionPath="/custom-order"
                        />
                    ) : (
                        <div className="space-y-6">
                            {customOrders.map((co, index) => (
                                <motion.div
                                    key={co.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                                >
                                    <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
                                        <div className="flex space-x-8 text-sm">
                                            <div>
                                                <span className="block text-gray-400 text-[10px] uppercase font-black tracking-widest">Request</span>
                                                <span className="text-gray-900 font-bold font-serif">{co.itemName}</span>
                                            </div>
                                            <div>
                                                <span className="block text-gray-400 text-[10px] uppercase font-black tracking-widest">Quantity</span>
                                                <span className="text-gray-900 font-bold font-serif">{co.quantity}</span>
                                            </div>
                                            <div>
                                                <span className="block text-gray-400 text-[10px] uppercase font-black tracking-widest">Budget</span>
                                                <span className="text-gray-900 font-bold font-serif">₹{co.budget?.toLocaleString() || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                                            {formatDate(co.createdAt)}
                                        </span>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        <p className="text-sm text-gray-600">{co.description}</p>

                                        {/* Timeline */}
                                        <div className="pt-2">
                                            <OrderTimeline currentStatus={co.status} updatedAt={co.updatedAt} />
                                        </div>

                                        {/* Admin response */}
                                        {co.adminNote && (
                                            <div className="bg-primary/5 rounded-2xl px-5 py-4 border border-primary/10">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Admin Response</p>
                                                <p className="text-sm text-gray-700">{co.adminNote}</p>
                                            </div>
                                        )}

                                        {co.agreedPrice && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <DollarSign className="h-4 w-4 text-secondary" />
                                                <span className="text-gray-500">Agreed Price:</span>
                                                <span className="font-bold text-secondary text-lg font-serif">₹{co.agreedPrice.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default MyOrdersPage;
