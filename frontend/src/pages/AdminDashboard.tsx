import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import {
    ShoppingBag, Package, Users, TrendingUp, Sparkles,
    AlertTriangle, CheckCircle2, Clock, Tag, Boxes, BarChart3, ArrowUpRight
} from 'lucide-react';
import { clsx } from 'clsx';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

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
    revenueHistory?: Record<string, number>;
    couponMetrics?: Record<string, number>;
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
    const [timeLeftMins, setTimeLeftMins] = useState<number>(0);
    const [timeLeftSecs, setTimeLeftSecs] = useState<number>(0);
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

    // Live mode / Session Tracking effect
    useEffect(() => {
        // Check session storage on mount
        const sessionExpiry = sessionStorage.getItem('adminDashExpiry');
        if (sessionExpiry) {
            const expiryTime = parseInt(sessionExpiry, 10);
            if (Date.now() < expiryTime) {
                setIsLive(true);
            }
        }
    }, []);

    useEffect(() => {
        if (!isLive) {
            setTimeLeftMins(0);
            setTimeLeftSecs(0);
            return;
        }

        // Fetch immediately upon going live
        fetchStats();

        // Ensure we have an expiry time
        let expiryTime = parseInt(sessionStorage.getItem('adminDashExpiry') || '0', 10);
        if (expiryTime < Date.now()) {
            expiryTime = Date.now() + 10 * 60 * 1000;
            sessionStorage.setItem('adminDashExpiry', expiryTime.toString());
        }

        // Start 30s polling
        const pollInterval = setInterval(fetchStats, 30_000);

        // Countdown Timer
        const tick = () => {
            const remaining = expiryTime - Date.now();
            if (remaining <= 0) {
                setIsLive(false);
                sessionStorage.removeItem('adminDashExpiry');
            } else {
                setTimeLeftMins(Math.floor(remaining / 60000));
                setTimeLeftSecs(Math.floor((remaining % 60000) / 1000));
            }
        };

        tick(); // Immediate tick
        const timerInterval = setInterval(tick, 1000);

        return () => {
            clearInterval(pollInterval);
            clearInterval(timerInterval);
        };
    }, [isLive]);

    const handleGoLive = () => {
        setLoading(true);
        // Simulate "Fetching..." animation delay
        setTimeout(() => {
            sessionStorage.setItem('adminDashExpiry', (Date.now() + 10 * 60 * 1000).toString());
            setIsLive(true);
        }, 1200);
    };

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
            icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20'
        },
        {
            label: 'GTV Revenue', value: `₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN')}`,
            sub: 'From paid orders',
            icon: TrendingUp, color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/20'
        },
        {
            label: 'Products', value: stats.totalActiveProducts,
            sub: `${stats.inStockProducts} in stock`,
            icon: Package, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/10'
        },
        {
            label: 'Total Users', value: stats.totalUsers,
            sub: 'Registered accounts',
            icon: Users, color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/20'
        },
    ] : [];

    return (
        <div className="flex min-h-screen font-sans" style={{ backgroundColor: 'var(--admin-page-bg)' }}>
            <AdminSidebar />
            <main className="flex-1 p-6 lg:p-10 overflow-auto">
                <motion.header
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-10 flex justify-between items-end"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Management Suite</span>
                        </div>
                        <h1 className="text-4xl font-black font-serif" style={{ color: 'var(--admin-nav-text)' }}>Overview Dashboard</h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--admin-nav-text)', opacity: 0.7 }}>
                            {isLive ? 'Live data • auto-refreshes every 30s' : 'Dashboard paused to save server load'}
                            {lastUpdated && ` • Last updated: ${lastUpdated.toLocaleTimeString()}`}
                        </p>
                    </div>
                    {isLive ? (
                        <div className="flex items-center gap-3 text-xs font-medium px-4 py-2 rounded-full shadow-sm" style={{ backgroundColor: 'var(--admin-sidebar-bg)', color: 'var(--admin-nav-text)', border: '1px solid var(--admin-sidebar-border)' }}>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                                <span className="font-bold">Live Session</span>
                            </div>
                            <span className="opacity-40">|</span>
                            <span className="tabular-nums font-bold text-primary">
                                {String(timeLeftMins).padStart(2, '0')}:{String(timeLeftSecs).padStart(2, '0')}
                            </span>
                        </div>
                    ) : (
                        <button onClick={handleGoLive} disabled={loading} className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-white dark:bg-neutral-800 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light px-3 py-1.5 rounded-full border border-gray-200 dark:border-neutral-700 shadow-sm transition-colors">
                            <Clock className="h-3 w-3" />
                            {loading ? 'Connecting...' : 'Idle Auto-Shutoff'}
                        </button>
                    )}

                </motion.header>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> {error}
                    </div>
                )}

                {loading && !isLive ? ( // Only show loading spinner if not live yet
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-neutral-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-700 animate-pulse h-36" />
                        ))}
                    </div>
                ) : !isLive && !stats ? (
                    <motion.div
                        variants={container}
                        className="rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden h-[400px]"
                        style={{ backgroundColor: 'var(--admin-card-bg)', border: '1px solid var(--admin-card-border)' }}
                    >
                        <div className="absolute inset-0 bg-pattern opacity-[0.03] dark:opacity-[0.05]" />

                        <div className="relative z-10 flex flex-col items-center">
                            {loading ? (
                                <div className="flex flex-col items-center">
                                    <div className="h-16 w-16 mb-6 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                                    <h2 className="text-2xl font-black font-serif mb-2" style={{ color: 'var(--admin-nav-text)' }}>Connecting to Store</h2>
                                    <p className="text-sm max-w-sm" style={{ color: 'var(--admin-nav-text)', opacity: 0.7 }}>Securely establishing real-time session...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                        <BarChart3 className="h-10 w-10 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-black font-serif mb-2" style={{ color: 'var(--admin-nav-text)' }}>Dashboard Idle</h2>
                                    <p className="max-w-md text-sm mb-8 leading-relaxed" style={{ color: 'var(--admin-nav-text)', opacity: 0.7 }}>
                                        Click Go Live to fetch real-time store metrics. The connection will automatically close after 10 minutes to conserve secure server resources.
                                    </p>
                                    <button
                                        onClick={handleGoLive}
                                        className="bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                                    >
                                        GO LIVE <ArrowUpRight className="h-4 w-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                ) : stats && (
                    <div className="flex flex-col gap-10">
                        {/* ── Urgent Alerts ── */}
                        {stats.lowStockProducts > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2.5rem] flex items-center justify-between"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="h-14 w-14 bg-red-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-red-500/20">
                                        <AlertTriangle className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-red-600 uppercase tracking-[0.2em]">Inventory Alert</p>
                                        <p className="text-sm text-red-500/80 font-bold mt-1">{stats.lowStockProducts} products have dropped below the safety threshold (5 units).</p>
                                    </div>
                                </div>
                                <a href="/admin/products" className="px-6 py-3 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95">
                                    Restock Now
                                </a>
                            </motion.div>
                        )}

                        {/* ── Revenue History Chart ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-neutral-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-700 shadow-sm mb-10 overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white font-serif tracking-tight">Revenue Growth Trend</h2>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Direct Sales Attribution · 7 Days</p>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/10">
                                    <TrendingUp className="h-3 w-3" /> Volume Increasing
                                </div>
                            </div>

                            <div className="h-[350px] w-full relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={stats?.revenueHistory ? Object.entries(stats.revenueHistory).map(([date, value]) => ({
                                            date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                                            amount: value
                                        })) : []}
                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF' }}
                                            tickFormatter={(val) => `₹${val}`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '20px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                                                backgroundColor: '#171717',
                                                padding: '12px 16px'
                                            }}
                                            itemStyle={{ color: '#D4AF37', fontWeight: '900', fontSize: '14px' }}
                                            labelStyle={{ color: '#6B7280', fontWeight: 'bold', marginBottom: '4px' }}
                                            formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#D4AF37"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorRev)"
                                            animationDuration={2000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            {/* Coupon Pulse */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white dark:bg-neutral-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-700 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 dark:text-white font-serif">Promo Impact</h2>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Usage Count</p>
                                    </div>
                                    <Tag className="h-5 w-5 text-gray-400" />
                                </div>

                                {stats?.couponMetrics && Object.keys(stats.couponMetrics).length > 0 ? (
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={Object.entries(stats.couponMetrics).map(([code, count]) => ({ code, count }))}>
                                                <XAxis dataKey="code" hide />
                                                <YAxis hide />
                                                <Tooltip
                                                    cursor={{ fill: 'rgba(212, 175, 55, 0.05)' }}
                                                    contentStyle={{
                                                        borderRadius: '16px',
                                                        border: 'none',
                                                        backgroundColor: '#262626',
                                                        fontSize: '10px',
                                                        color: '#fff'
                                                    }}
                                                />
                                                <Bar dataKey="count" radius={[8, 8, 8, 8]}>
                                                    {Object.entries(stats.couponMetrics).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#D4AF37' : '#B8860B'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {Object.entries(stats.couponMetrics).map(([code, count], i) => (
                                                <div key={code} className="px-2 py-1 rounded-lg bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-gray-900 dark:text-white">{code}</span>
                                                    <span className="text-[10px] font-bold text-primary">{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-20 text-center text-gray-400 italic text-sm">No coupon data available</div>
                                )}
                            </motion.div>

                            {/* Recent Pulse */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
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
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
