import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import {
    ShoppingBag, Package, Users, TrendingUp, Sparkles,
    AlertTriangle, CheckCircle2, Clock, Tag, Boxes, BarChart3, ArrowUpRight
} from 'lucide-react';
import api from '../services/api';
import { motion } from 'framer-motion';

interface DashboardStats {
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    totalActiveProducts: number;
    inStockProducts: number;
    outOfStockProducts: number;
    lowStockProducts: number;
    totalCategories: number;
    totalUsers: number;
    totalCustomOrders: number;
    pendingCustomOrders: number;
    recentOrders: {
        id: number;
        status: string;
        totalAmount: number;
        totalItems: number;
        createdAt: string;
        userName: string;
    }[];
}

const statusColors: Record<string, string> = {
    CREATED: 'bg-blue-100 text-blue-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    MOCK_PAID: 'bg-green-100 text-green-700',
    PAID: 'bg-green-100 text-green-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
};

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isLive, setIsLive] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Fetch stats function
    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/stats');
            setStats(res.data);
            setLastUpdated(new Date());
            setError('');
        } catch (err: any) {
            console.error("Failed to fetch dashboard stats", err);
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                window.location.href = '/login?expired=true';
            } else {
                setError('Failed to load dashboard. Please try again.');
                setIsLive(false); // Stop live mode on error
            }
        } finally {
            setLoading(false);
        }
    };

    // Live mode / Idle tracking effect
    useEffect(() => {
        if (!isLive) return;

        // Fetch immediately upon going live
        fetchStats();

        // Start 30s polling
        const pollInterval = setInterval(fetchStats, 30_000);

        // Idle Tracking (10 minutes)
        const IDLE_TIMEOUT_MS = 10 * 60 * 1000;
        let idleTimer: ReturnType<typeof setTimeout>;

        const resetIdleTimer = () => {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                setIsLive(false); // Auto shutoff after 10 mins idle
            }, IDLE_TIMEOUT_MS);
        };

        // Bind events
        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(e => window.addEventListener(e, resetIdleTimer));
        resetIdleTimer(); // INIT

        return () => {
            clearInterval(pollInterval);
            clearTimeout(idleTimer);
            events.forEach(e => window.removeEventListener(e, resetIdleTimer));
        };
    }, [isLive]);

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };
    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 120 } }
    };

    const statCards = stats ? [
        {
            label: 'Total Orders', value: stats.totalOrders,
            sub: `${stats.pendingOrders} pending`,
            icon: ShoppingBag, color: 'text-secondary', bg: 'bg-secondary/5', border: 'border-secondary/10'
        },
        {
            label: 'GTV Revenue', value: `₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN')}`,
            sub: 'From paid orders',
            icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/10'
        },
        {
            label: 'Products', value: stats.totalActiveProducts,
            sub: `${stats.inStockProducts} in stock`,
            icon: Package, color: 'text-green-500', bg: 'bg-green-500/5', border: 'border-green-500/10'
        },
        {
            label: 'Total Users', value: stats.totalUsers,
            sub: 'Registered accounts',
            icon: Users, color: 'text-accent', bg: 'bg-accent/5', border: 'border-accent/10'
        },
    ] : [];

    return (
        <div className="flex min-h-screen bg-neutral-light dark:bg-neutral-900 font-sans">
            <AdminSidebar />
            <main className="flex-1 p-6 lg:p-10 overflow-auto">
                <motion.header
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-10 flex justify-between items-end"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-5 w-5 text-primary dark:text-primary-light" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary dark:text-primary-light">Management Suite</span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white font-serif">Overview Dashboard</h1>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            {isLive ? 'Live data • auto-refreshes every 30s' : 'Dashboard paused to save server load'}
                            {lastUpdated && ` • Last updated: ${lastUpdated.toLocaleTimeString()}`}
                        </p>
                    </div>
                    {isLive ? (
                        <div className="flex items-center gap-2 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800 shadow-sm">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                            Live Session
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-neutral-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-neutral-700">
                            <Clock className="h-3 w-3" />
                            Idle Auto-Shutoff
                        </div>
                    )}

                </motion.header>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> {error}
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-neutral-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-700 animate-pulse h-36" />
                        ))}
                    </div>
                ) : !isLive && !stats ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 bg-white dark:bg-neutral-800 rounded-[2.5rem] border border-gray-100 dark:border-neutral-700 shadow-sm mt-4">
                        <div className="h-24 w-24 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-6 relative group">
                            <div className="absolute inset-0 bg-primary/20 dark:bg-primary/30 rounded-full animate-ping opacity-75" />
                            <BarChart3 className="h-10 w-10 text-primary dark:text-primary-light relative z-10" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white font-serif mb-2">Dashboard Idle</h2>
                        <p className="text-sm text-gray-500 max-w-sm text-center mb-8">Click Go Live to fetch real-time store metrics. The connection will automatically pause after 10 minutes of inactivity to conserve server resources.</p>
                        <button
                            onClick={() => setIsLive(true)}
                            className="group flex items-center gap-2 px-8 py-4 bg-primary text-white text-sm font-black tracking-widest uppercase rounded-2xl hover:bg-accent transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1"
                        >
                            Go Live <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </motion.div>
                ) : stats && (
                    <>
                        {/* ── Top Stat Cards ── */}
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
                        >
                            {statCards.map((stat, index) => (
                                <motion.div
                                    variants={item}
                                    key={index}
                                    whileHover={{ y: -4 }}
                                    className={`bg-white dark:bg-neutral-800 p-8 rounded-[2.5rem] border ${stat.border.replace('border-', 'border-').concat(' dark:border-opacity-20')} shadow-sm group cursor-default`}
                                >
                                    <div className="flex items-center justify-between mb-5">
                                        <div className={`p-4 rounded-2xl ${stat.bg.replace('bg-', 'bg-').concat(' dark:bg-opacity-20')} ${stat.color} transition-colors group-hover:bg-primary group-hover:text-white`}>
                                            <stat.icon className="h-6 w-6" />
                                        </div>
                                        <ArrowUpRight className="h-4 w-4 text-gray-200 dark:text-gray-600" />
                                    </div>
                                    <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{stat.label}</h3>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">{stat.sub}</p>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* ── Lower 2-col row ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Recent Pulse */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white dark:bg-neutral-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-700 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white font-serif">Recent Pulse</h2>
                                    <Clock className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                                </div>
                                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                                    <div className="space-y-3">
                                        {stats.recentOrders.map(order => (
                                            <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-neutral-700/50 last:border-0">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Order #{order.id}</p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500">{order.userName} · {order.totalItems} items</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-gray-900 dark:text-white">₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</p>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-300'}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-300 dark:text-gray-600 text-center py-16 italic font-medium">No orders yet. Listening for store activity...</p>
                                )}
                            </motion.div>

                            {/* Inventory Health */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white dark:bg-neutral-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-700 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white font-serif">Inventory Health</h2>
                                    <BarChart3 className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                                </div>
                                {stats && (
                                    <div className="space-y-5">
                                        {/* In Stock */}
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-xs font-black text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 dark:text-green-400" /> In Stock
                                                </span>
                                                <span className="text-sm font-black text-green-600 dark:text-green-400">{stats.inStockProducts}</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: stats.totalActiveProducts > 0 ? `${(stats.inStockProducts / stats.totalActiveProducts) * 100}%` : '0%' }}
                                                    transition={{ duration: 0.8, delay: 0.5 }}
                                                    className="h-full bg-green-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                        {/* Low Stock */}
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-xs font-black text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 dark:text-yellow-400" /> Low Stock (≤5 units)
                                                </span>
                                                <span className="text-sm font-black text-yellow-600 dark:text-yellow-400">{stats.lowStockProducts}</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: stats.totalActiveProducts > 0 ? `${(stats.lowStockProducts / stats.totalActiveProducts) * 100}%` : '0%' }}
                                                    transition={{ duration: 0.8, delay: 0.6 }}
                                                    className="h-full bg-yellow-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                        {/* Out of Stock */}
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-xs font-black text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                                    <AlertTriangle className="h-3.5 w-3.5 text-red-500 dark:text-red-400" /> Out of Stock
                                                </span>
                                                <span className="text-sm font-black text-red-600 dark:text-red-400">{stats.outOfStockProducts}</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: stats.totalActiveProducts > 0 ? `${(stats.outOfStockProducts / stats.totalActiveProducts) * 100}%` : '0%' }}
                                                    transition={{ duration: 0.8, delay: 0.7 }}
                                                    className="h-full bg-red-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* ── Bottom Catalog Row ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-6"
                        >
                            {[
                                { label: 'Categories', value: stats?.totalCategories ?? 0, icon: Tag, color: 'text-primary dark:text-primary-light' },
                                { label: 'Products In Stock', value: stats?.inStockProducts ?? 0, icon: CheckCircle2, color: 'text-green-600 dark:text-green-400' },
                                { label: 'Out of Stock', value: stats?.outOfStockProducts ?? 0, icon: AlertTriangle, color: 'text-red-500 dark:text-red-400' },
                                { label: 'Custom Requests', value: stats?.totalCustomOrders ?? 0, icon: Boxes, color: 'text-accent dark:text-accent-light', sub: `${stats?.pendingCustomOrders ?? 0} pending` },
                            ].map((card, i) => (
                                <div key={i} className="bg-white dark:bg-neutral-800 rounded-3xl p-6 border border-gray-100 dark:border-neutral-700 shadow-sm">
                                    <card.icon className={`h-5 w-5 mb-4 ${card.color}`} />
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">{card.value}</p>
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">{card.label}</p>
                                    {card.sub && <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5">{card.sub}</p>}
                                </div>
                            ))}
                        </motion.div>
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
