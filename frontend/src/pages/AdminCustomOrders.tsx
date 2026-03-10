import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, CheckCircle, DollarSign, X } from 'lucide-react';
import { getAllCustomOrders, approveCustomOrder, quoteCustomOrder, rejectCustomOrder, updateCustomOrderStatus } from '../services/CustomOrderService';
import type { CustomOrderResponse, CustomOrderStatus } from '../types/customOrder.types';
import { CUSTOM_ORDER_STATUS_LABELS } from '../types/customOrder.types';
import OrderTimeline from '../components/OrderTimeline';
import { useSSE } from '../hooks/useSSE';


const STATUS_COLORS: Record<CustomOrderStatus, string> = {
    REQUESTED: 'bg-blue-100 text-blue-700',
    QUOTED: 'bg-yellow-100 text-yellow-700',
    NEGOTIATING: 'bg-orange-100 text-orange-700',
    ACCEPTED_BY_CUSTOMER: 'bg-teal-100 text-teal-700',
    APPROVED: 'bg-green-100 text-green-700',
    PAYMENT_PENDING: 'bg-amber-100 text-amber-700',
    PAID: 'bg-primary/10 text-primary',
    PROCESSING: 'bg-secondary/10 text-secondary',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
};

const PAYMENT_MODE_LABELS: Record<string, string> = {
    'ONLINE': 'Full Payment Online',
    'COD_50': '50% Downpayment (COD)',
    'COD_100': '100% COD (Full)',
    // Backwards compatibility for raw strings
    'Full Payment Online': 'Full Payment Online',
    '50% Downpayment (COD)': '50% Downpayment (COD)',
    '100% COD': '100% COD (Full)'
};

const AdminCustomOrders: React.FC = () => {
    const [orders, setOrders] = useState<CustomOrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [selectedOrder, setSelectedOrder] = useState<CustomOrderResponse | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'quote' | 'reject' | 'status' | null>(null);
    const [actionPrice, setActionPrice] = useState('');
    const [actionNote, setActionNote] = useState('');
    const [actionStatus, setActionStatus] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

    const toggleExpand = (id: number) => {
        setExpandedOrderId(prev => prev === id ? null : id);
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await getAllCustomOrders(filterStatus || undefined);
            setOrders(data);
        } catch (err) {
            console.error('Failed to fetch custom orders', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [filterStatus]);

    // ────────────────────────────────────────────────────────────────────
    // Object Real-time Sync
    // ────────────────────────────────────────────────────────────────────
    const { events: sseEvents } = useSSE(['CUSTOM_ORDER_UPDATED']);

    useEffect(() => {
        if (sseEvents['CUSTOM_ORDER_UPDATED']) {
            const updated = sseEvents['CUSTOM_ORDER_UPDATED'];
            setOrders(prev => {
                if (prev.find(o => o.id === updated.id)) {
                    // Update existing
                    return prev.map(o => o.id === updated.id ? { ...o, ...updated } : o);
                } else {
                    // It's a new request but we only have a partial DTO. Better to refetch to get all user data.
                    fetchOrders();
                    return prev;
                }
            });
        }
    }, [sseEvents['CUSTOM_ORDER_UPDATED']]);

    const handleAction = async () => {
        if (!selectedOrder) return;
        setActionLoading(true);
        try {
            if (actionType === 'approve') {
                await approveCustomOrder(selectedOrder.id, parseFloat(actionPrice), actionNote);
            } else if (actionType === 'quote') {
                await quoteCustomOrder(selectedOrder.id, parseFloat(actionPrice), actionNote);
            } else if (actionType === 'reject') {
                await rejectCustomOrder(selectedOrder.id, actionNote);
            } else if (actionType === 'status') {
                await updateCustomOrderStatus(selectedOrder.id, actionStatus);
            }
            closeModal();
            fetchOrders();
        } catch (err) {
            console.error('Action failed', err);
        } finally {
            setActionLoading(false);
        }
    };

    const openModal = (order: CustomOrderResponse, type: 'approve' | 'quote' | 'reject' | 'status') => {
        setSelectedOrder(order);
        setActionType(type);
        setActionPrice(order.agreedPrice?.toString() || '');
        setActionNote('');
        setActionStatus('');
    };

    const closeModal = () => {
        setSelectedOrder(null);
        setActionType(null);
        setActionPrice('');
        setActionNote('');
        setActionStatus('');
    };

    return (
        <main className="p-6 lg:p-10 w-full overflow-auto">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 font-serif">Custom <span className="text-primary italic">Requests</span></h1>
                        <p className="text-sm text-gray-500 mt-1">Manage custom order requests from customers</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary outline-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="REQUESTED">Requested</option>
                            <option value="QUOTED">Quoted</option>
                            <option value="APPROVED">Approved</option>
                            <option value="PAID">Paid</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No custom orders found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-gray-900">{order.itemName}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[order.status]}`}>
                                                {CUSTOM_ORDER_STATUS_LABELS[order.status]}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-2">{order.description}</p>
                                        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Package className="h-3 w-3" /> Qty: {order.quantity}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="h-3 w-3" /> Budget: ₹{order.budget?.toLocaleString() || 'N/A'}
                                            </span>
                                            {order.agreedPrice && (
                                                <span className="flex items-center gap-1 text-primary font-bold">
                                                    <CheckCircle className="h-3 w-3" /> Agreed: ₹{order.agreedPrice.toLocaleString()}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>

                                        {/* Toggle Sender Details & History */}
                                        <div className="pt-2">
                                            <button
                                                onClick={() => toggleExpand(order.id)}
                                                className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-dark transition-colors flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10"
                                            >
                                                {expandedOrderId === order.id ? 'Hide Details & History' : 'View Sender Details & History'}
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {expandedOrderId === order.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-8">
                                                        {/* Sender Details */}
                                                        <div className="flex-1 space-y-3">
                                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-2">Sender Details</h4>
                                                            {order.user ? (
                                                                <div className="space-y-2">
                                                                    <div>
                                                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Name</p>
                                                                        <p className="text-sm font-bold text-gray-900">{order.user.username}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Email</p>
                                                                        <p className="text-sm text-gray-600">{order.user.email}</p>
                                                                    </div>
                                                                    {order.user.phone && (
                                                                        <div>
                                                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Phone</p>
                                                                            <p className="text-sm text-gray-600">{order.user.phone}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-gray-500 italic">User details unavailable</p>
                                                            )}
                                                            {order.adminNote && (
                                                                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                                                    <p className="text-[10px] font-bold text-yellow-600 uppercase mb-1">Admin Note / Quote Info</p>
                                                                    <p className="text-sm text-yellow-800">{order.adminNote}</p>
                                                                </div>
                                                            )}
                                                            {(order.customerNote || order.paymentMode) && (
                                                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Customer Note / Negotiation</p>
                                                                    {order.customerNote && <p className="text-sm text-blue-800 mb-2">{order.customerNote}</p>}
                                                                    {order.paymentMode && (
                                                                        <div className="pt-2 border-t border-blue-200 text-xs text-blue-900">
                                                                            <span className="font-bold">Payment Pref:</span> {PAYMENT_MODE_LABELS[order.paymentMode] || order.paymentMode}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* History Timeline */}
                                                        <div className="flex-1">
                                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-2 mb-4">Request History Logging</h4>
                                                            <OrderTimeline currentStatus={order.status} updatedAt={order.updatedAt} />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2 shrink-0">
                                        {order.status === 'REQUESTED' && (
                                            <>
                                                <button
                                                    onClick={() => openModal(order, 'approve')}
                                                    className="px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-colors"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => openModal(order, 'quote')}
                                                    className="px-4 py-2 bg-secondary text-white rounded-xl text-xs font-bold hover:bg-yellow-600 transition-colors"
                                                >
                                                    Quote
                                                </button>
                                                <button
                                                    onClick={() => openModal(order, 'reject')}
                                                    className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {['QUOTED', 'NEGOTIATING'].includes(order.status) && (
                                            <>
                                                <button
                                                    onClick={() => openModal(order, 'approve')}
                                                    className="px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-colors"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => openModal(order, 'quote')}
                                                    className="px-4 py-2 bg-secondary text-white rounded-xl text-xs font-bold hover:bg-yellow-600 transition-colors"
                                                >
                                                    {order.status === 'NEGOTIATING' ? 'Re-Quote' : 'Edit Quote'}
                                                </button>
                                                <button
                                                    onClick={() => openModal(order, 'reject')}
                                                    className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {order.status === 'ACCEPTED_BY_CUSTOMER' && (
                                            <button
                                                onClick={() => openModal(order, 'approve')}
                                                className="px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-colors shadow-md"
                                            >
                                                Finalize Approval
                                            </button>
                                        )}
                                        {['PAYMENT_PENDING', 'PAID', 'PROCESSING', 'SHIPPED'].includes(order.status) && (
                                            <button
                                                onClick={() => openModal(order, 'status')}
                                                className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-accent transition-colors"
                                            >
                                                Update Status
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Action Modal */}
                <AnimatePresence>
                    {selectedOrder && actionType && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={closeModal}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-black text-gray-900 capitalize">{actionType} Request</h3>
                                    <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                        <X className="h-5 w-5 text-gray-400" />
                                    </button>
                                </div>

                                <p className="text-sm text-gray-500 mb-6">
                                    <span className="font-bold text-gray-700">{selectedOrder.itemName}</span> — {selectedOrder.quantity} units
                                </p>

                                {(actionType === 'approve' || actionType === 'quote') && (
                                    <div className="space-y-2 mb-4">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Agreed Price (₹)</label>
                                        <input
                                            type="number"
                                            value={actionPrice}
                                            onChange={(e) => setActionPrice(e.target.value)}
                                            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="e.g. 1000"
                                        />
                                    </div>
                                )}

                                {actionType === 'status' && (
                                    <div className="space-y-2 mb-4">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">New Status</label>
                                        <select
                                            value={actionStatus}
                                            onChange={(e) => setActionStatus(e.target.value)}
                                            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                                        >
                                            <option value="">Select status</option>
                                            <option value="PAID">Paid</option>
                                            <option value="PROCESSING">Processing</option>
                                            <option value="SHIPPED">Shipped</option>
                                            <option value="DELIVERED">Delivered</option>
                                        </select>
                                    </div>
                                )}

                                {actionType !== 'status' && (
                                    <div className="space-y-2 mb-6">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Note to Customer</label>
                                        <textarea
                                            value={actionNote}
                                            onChange={(e) => setActionNote(e.target.value)}
                                            rows={3}
                                            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                                            placeholder={actionType === 'reject' ? 'Reason for rejection...' : 'Any notes for the customer...'}
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={handleAction}
                                    disabled={actionLoading || (actionType === 'status' && !actionStatus)}
                                    className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-white transition-all ${actionType === 'reject'
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : 'bg-primary hover:bg-accent shadow-lg shadow-primary/20'
                                        }`}
                                >
                                    {actionLoading ? 'Processing...' : `Confirm ${actionType}`}
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
};

export default AdminCustomOrders;
