import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { Search, Eye, MoreHorizontal, Filter, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';
import type { Order } from '../types/Order';
import { clsx } from 'clsx';

const AdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders/all');
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId: number, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
            setOrders(orders.map(o => o.id === orderId ? res.data : o));
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Error updating status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID': return <Clock className="h-4 w-4 mr-2" />;
            case 'SHIPPED': return <Truck className="h-4 w-4 mr-2" />;
            case 'DELIVERED': return <CheckCircle className="h-4 w-4 mr-2" />;
            default: return <Package className="h-4 w-4 mr-2" />;
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'SHIPPED': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'DELIVERED': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="flex min-h-screen bg-neutral-light font-sans">
            <AdminSidebar />
            <main className="flex-1 p-8">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-serif">Order Management</h1>
                        <p className="text-gray-500 mt-1">Track and manage customer orders and shipments.</p>
                    </div>
                    <div className="flex space-x-2 text-xs font-bold text-gray-400">
                        <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-blue-500 mr-1"></span> PAID</span>
                        <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-amber-500 mr-1"></span> SHIPPED</span>
                        <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span> DELIVERED</span>
                    </div>
                </header>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                        <div className="relative w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search #Order ID, Name..."
                                className="pl-12 pr-4 py-3 w-full bg-white border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                            />
                        </div>
                        <button className="inline-flex items-center px-4 py-2 text-sm font-bold text-gray-500 hover:text-primary bg-white border border-gray-200 rounded-xl hover:border-primary/30 transition-all">
                            <Filter className="h-4 w-4 mr-2" /> All Orders
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-light/50 text-gray-400 text-[10px] uppercase tracking-widest font-black">
                                <tr>
                                    <th className="px-6 py-5">Reference</th>
                                    <th className="px-6 py-5">Customer</th>
                                    <th className="px-6 py-5">Revenue</th>
                                    <th className="px-6 py-5">Complexity</th>
                                    <th className="px-6 py-5">Current Status</th>
                                    <th className="px-6 py-5">Placed On</th>
                                    <th className="px-6 py-5 text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={7} className="text-center py-20 text-gray-400 font-medium animate-pulse">Scanning orders...</td></tr>
                                ) : orders.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-20 text-gray-400 font-medium">No active orders in the system.</td></tr>
                                ) : orders.map(order => (
                                    <tr key={order.id} className="hover:bg-neutral-light/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <span className="font-mono text-xs text-primary font-black bg-primary/5 px-2 py-1 rounded-lg">#ORD-{order.id.toString().padStart(5, '0')}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary mr-3">
                                                    {order.user.username.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-bold text-gray-800 capitalize">{order.user.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-black text-gray-900">₹{order.totalAmount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-5 text-xs text-gray-500 font-medium">
                                            {order.totalItems} Units
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={clsx(
                                                "inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                                getStatusStyle(order.status),
                                                updatingId === order.id && "animate-pulse opacity-50"
                                            )}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-gray-400 text-xs font-bold">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <select
                                                    disabled={updatingId === order.id}
                                                    value={order.status}
                                                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                    className="text-[10px] font-bold uppercase tracking-tighter bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                >
                                                    <option value="PAID">Mark Paid</option>
                                                    <option value="SHIPPED">Mark Shipped</option>
                                                    <option value="DELIVERED">Mark Delivered</option>
                                                </select>
                                                <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary Info */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start space-x-4">
                        <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                            <Truck className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Pending Shipments</h4>
                            <p className="text-2xl font-black text-gray-900">{orders.filter(o => o.status === 'PAID').length}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start space-x-4">
                        <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Orders Today</h4>
                            <p className="text-2xl font-black text-gray-900">{orders.length}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start space-x-4 text-primary">
                        <Activity className="h-10 w-10 opacity-20 absolute right-4 top-4" />
                        <div className="p-3 rounded-2xl bg-primary/5">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Urgent Actions</h4>
                            <p className="text-2xl font-black">0</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminOrders;
