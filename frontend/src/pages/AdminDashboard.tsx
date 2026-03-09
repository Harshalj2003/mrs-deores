import React, { useEffect, useState } from 'react';

import {
    TrendingUp, Sparkles, Users, Package,
    AlertTriangle, CheckCircle2, Clock, Tag, Boxes, BarChart3, ArrowUpRight
} from 'lucide-react';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { useSSE } from '../hooks/useSSE';

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
    activeUsers: number;
    inactiveUsers: number;
    successfulOrders: number;
    cancelledOrders: number;
    returnedOrders: number;
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

// ────────────────────────────────────────────────────────────────────
// Live Sessions Panel — real-time active users with time filters
// ────────────────────────────────────────────────────────────────────
interface ActiveSession {
    userId: number;
    sessionStart: string;
    lastSeen: string;
    durationSeconds: number;
    isLive: boolean;
}
interface SessionsResponse {
    sessions: ActiveSession[];
    count: number;
    window: string;
    source: 'live' | 'database';
}
interface UserBrief {
    id: number;
    username: string;
    email: string;
    phone: string | null;
    lastLoginAt: string | null;
    createdAt: string | null;
}

const TIME_WINDOWS = [
    { key: '10m', label: '10 min' },
    { key: '1h', label: '1 hour' },
    { key: '7h', label: '7 hours' },
    { key: '1d', label: '1 day' },
    { key: '1w', label: '1 week' },
    { key: '1m', label: '1 month' },
    { key: '3m', label: '3 months' },
];

const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
};

const formatTime = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const LiveSessionsPanel: React.FC = () => {
    const [window, setWindow] = useState('10m');
    const [data, setData] = useState<SessionsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
    const [userBrief, setUserBrief] = useState<UserBrief | null>(null);
    const [briefLoading, setBriefLoading] = useState(false);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/active-sessions?window=${window}`);
            setData(res.data);
        } catch (err) {
            console.error('Failed to fetch active sessions', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount + on window change + auto-refresh every 15s
    useEffect(() => {
        fetchSessions();
        const interval = setInterval(fetchSessions, 15000);
        return () => clearInterval(interval);
    }, [window]);

    const handleExpand = async (userId: number) => {
        if (expandedUserId === userId) {
            setExpandedUserId(null);
            setUserBrief(null);
            return;
        }
        setExpandedUserId(userId);
        setUserBrief(null);
        setBriefLoading(true);
        try {
            const res = await api.get(`/admin/users/${userId}/brief`);
            setUserBrief(res.data);
        } catch {
            setUserBrief(null);
        } finally {
            setBriefLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-white dark:bg-neutral-800 rounded-[2.5rem] border border-gray-100 dark:border-neutral-700 shadow-sm mb-10 overflow-hidden"
        >
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center">
                            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-neutral-800 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900 dark:text-white font-serif">Live Active Users</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                            {data ? `${data.count} user${data.count !== 1 ? 's' : ''} • ${data.source === 'live' ? 'Real-time' : 'Historical'}` : 'Loading...'}
                        </p>
                    </div>
                </div>

                {/* Time Filter Buttons */}
                <div className="flex gap-1.5 flex-wrap">
                    {TIME_WINDOWS.map(tw => (
                        <button
                            key={tw.key}
                            onClick={() => setWindow(tw.key)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${window === tw.key
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                : 'bg-gray-100 dark:bg-neutral-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-600'
                                }`}
                        >
                            {tw.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sessions Table */}
            {loading && !data ? (
                <div className="p-12 text-center">
                    <div className="h-8 w-8 mx-auto rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
                    <p className="text-sm text-gray-400 mt-3">Fetching live sessions...</p>
                </div>
            ) : data?.sessions && data.sessions.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-neutral-700">
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest w-8">#</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">User ID</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Session Duration</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Seen</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.sessions.map((session, idx) => (
                                <React.Fragment key={session.userId}>
                                    <tr
                                        onClick={() => handleExpand(session.userId)}
                                        className="border-b border-gray-50 dark:border-neutral-700/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4 text-xs text-gray-400">{idx + 1}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-neutral-900 px-2 py-1 rounded-lg">
                                                #{session.userId}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                {formatDuration(session.durationSeconds)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatTime(session.lastSeen)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {session.isLive ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-[10px] font-bold">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                                    Live Now
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-neutral-700 text-gray-500 dark:text-gray-400 text-[10px] font-bold">
                                                    <Clock className="h-3 w-3" />
                                                    Away
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                    {/* Expanded user details row */}
                                    {expandedUserId === session.userId && (
                                        <tr className="bg-green-50/50 dark:bg-green-500/[0.03]">
                                            <td colSpan={5} className="px-6 py-4">
                                                {briefLoading ? (
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <div className="h-4 w-4 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
                                                        Fetching user details...
                                                    </div>
                                                ) : userBrief ? (
                                                    <div className="flex flex-wrap gap-6 text-xs">
                                                        <div>
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Username</span>
                                                            <span className="font-bold text-gray-900 dark:text-white">{userBrief.username}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Email</span>
                                                            <span className="font-bold text-gray-900 dark:text-white">{userBrief.email}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Phone</span>
                                                            <span className="font-bold text-gray-900 dark:text-white">{userBrief.phone || '—'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Last Login</span>
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                {userBrief.lastLoginAt ? new Date(userBrief.lastLoginAt).toLocaleString('en-IN') : 'Never'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Joined</span>
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                {userBrief.createdAt ? new Date(userBrief.createdAt).toLocaleDateString('en-IN') : '—'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-red-400">Failed to load user details</span>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="p-12 text-center">
                    <Users className="h-8 w-8 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm text-gray-400 italic">
                        {data?.source === 'database'
                            ? `${data.count} user${data.count !== 1 ? 's' : ''} logged in during this period`
                            : 'No active sessions right now'}
                    </p>
                    {data?.source === 'database' && data.count > 0 && (
                        <p className="text-[10px] text-gray-400 mt-2">
                            Historical data — individual sessions not available for this time range
                        </p>
                    )}
                </div>
            )}
        </motion.div>
    );
};

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isLive, setIsLive] = useState(false);
    const [timeLeftMins, setTimeLeftMins] = useState<number>(0);
    const [timeLeftSecs, setTimeLeftSecs] = useState<number>(0);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Keep track of live status for the SSE callback without stale closures
    const { events: sseEvents } = useSSE(['STATS_UPDATED']);

    // Real-time Push Updates
    useEffect(() => {
        // When STATS_UPDATED changes, if we are live, refetch immediately
        if (sseEvents['STATS_UPDATED'] && isLive) {
            fetchStats();
        }
    }, [sseEvents['STATS_UPDATED']]);

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




    return (
        <main className="p-6 lg:p-10 w-full">
            <motion.header
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
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
                                                {Object.entries(stats.couponMetrics).map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#D4AF37' : '#B8860B'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {Object.entries(stats.couponMetrics).map(([code, count]) => (
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

                    {/* ── Advance Analysis ── */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white dark:bg-neutral-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-700 shadow-sm mb-10"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white font-serif">Advance Analysis</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Website Engagement & Returns</p>
                            </div>
                            <BarChart3 className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                            {[
                                { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-primary dark:text-primary-light', bg: 'bg-gradient-to-br from-primary/15 to-primary/5 dark:from-primary/20 dark:to-primary/5' },
                                { label: 'Active Users', value: stats?.activeUsers || 0, icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-gradient-to-br from-green-500/15 to-green-500/5 dark:from-green-500/20 dark:to-green-500/5' },
                                { label: 'Inactive Users', value: stats?.inactiveUsers || 0, icon: AlertTriangle, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-gradient-to-br from-yellow-500/15 to-yellow-500/5 dark:from-yellow-500/20 dark:to-yellow-500/5' },
                                { label: 'Success Orders', value: stats?.successfulOrders || 0, icon: Package, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 dark:from-emerald-500/20 dark:to-emerald-500/5' },
                                { label: 'Cancelled Orders', value: stats?.cancelledOrders || 0, icon: Boxes, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-gradient-to-br from-orange-500/15 to-orange-500/5 dark:from-orange-500/20 dark:to-orange-500/5' },
                                { label: 'Returned Orders', value: stats?.returnedOrders || 0, icon: ArrowUpRight, color: 'text-red-600 dark:text-red-400', bg: 'bg-gradient-to-br from-red-500/15 to-red-500/5 dark:from-red-500/20 dark:to-red-500/5' },
                            ].map((s, i) => (
                                <div key={i} className={`p-5 rounded-3xl ${s.bg} border border-white/40 dark:border-white/5 backdrop-blur-sm`}>
                                    <s.icon className={`h-5 w-5 mb-3 ${s.color}`} />
                                    <p className="text-xl font-black text-gray-900 dark:text-white">{s.value}</p>
                                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── Live Active Sessions Panel ── */}
                    <LiveSessionsPanel />

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
    );
};

export default AdminDashboard;
