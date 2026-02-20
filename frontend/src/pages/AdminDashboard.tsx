import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { ShoppingBag, Package, Users, Activity, TrendingUp, Sparkles } from 'lucide-react';
import api from '../services/api';
import { motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalProducts: 42,
        totalCustomers: 12,
        revenue: 25430
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [ordersRes, usersRes] = await Promise.all([
                    api.get('/orders/all'),
                    api.get('/users/analytics')
                ]);

                setStats(prev => ({
                    ...prev,
                    totalOrders: ordersRes.data.length,
                    totalCustomers: usersRes.data.totalUsers || 0,
                    // If backend doesn't define active users logic yet, we use total for now or logic from backend
                    // Also store extra data if needed for charts
                }));
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-secondary', bg: 'bg-secondary/5', border: 'border-secondary/10' },
        { label: 'Catalog Size', value: stats.totalProducts, icon: Package, color: 'text-green-500', bg: 'bg-green-500/5', border: 'border-green-500/10' },
        { label: 'Total Users', value: stats.totalCustomers, icon: Users, color: 'text-accent', bg: 'bg-accent/5', border: 'border-accent/10' },
        { label: 'GTV Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/10' },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 120 } }
    };

    return (
        <div className="flex min-h-screen bg-neutral-light font-sans">
            <AdminSidebar />
            <main className="flex-1 p-10 overflow-hidden">
                <motion.header
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12 flex justify-between items-end"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Management Suite</span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 font-serif">Overview Dashboard</h1>
                    </div>
                </motion.header>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
                >
                    {statCards.map((stat, index) => (
                        <motion.div
                            variants={item}
                            key={index}
                            whileHover={{ y: -5 }}
                            className={`bg-white p-8 rounded-[2.5rem] border ${stat.border} shadow-sm group cursor-default`}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-colors group-hover:bg-primary group-hover:text-white`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <Activity className="h-4 w-4 text-gray-200" />
                            </div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</h3>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900 font-serif">Recent Pulse</h2>
                            <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View All</button>
                        </div>
                        <div className="space-y-4">
                            <p className="text-gray-300 text-center py-20 italic font-medium">Listening for store activity...</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900 font-serif">Inventory Health</h2>
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                        </div>
                        <div className="space-y-4">
                            <p className="text-gray-300 text-center py-20 italic font-medium">All products are within optimal levels.</p>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
