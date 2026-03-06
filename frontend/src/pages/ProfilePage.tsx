import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { User as UserIcon, MapPin, Shield, LogOut, Lock, ArrowRight, Mail, CheckCircle2, AlertCircle, Crown } from 'lucide-react';
import type { User } from '../types/auth.types';
import AuthService from '../services/auth.service';
import AddressBook from '../components/AddressBook';
import AccountDetails from '../components/AccountDetails';
import { motion, AnimatePresence } from 'framer-motion';
// import api from '../services/api'; // removed unused import

const ProfilePage: React.FC = () => {
    const user: User | null = AuthService.getCurrentUser();
    const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'security'>('profile');

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="bg-[#FFF8E7] dark:bg-neutral-900 min-h-screen pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-1/4">
                        <div className="bg-white dark:bg-neutral-800 rounded-[2rem] border border-gray-100 dark:border-neutral-700 p-6 sticky top-24 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center font-serif text-2xl font-black">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-black text-gray-900 dark:text-white font-serif leading-none">{user.username}</h2>
                                        {user.roles.includes('ROLE_ADMIN') && (
                                            <span className="bg-accent/10 text-accent text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 border border-accent/20">
                                                <Crown className="h-2 w-2" /> Admin
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                        {!user.roles.includes('ROLE_ADMIN') && (
                                            user.isEmailVerified ? (
                                                <span className="text-[10px] font-bold text-green-500 flex items-center gap-0.5">
                                                    <CheckCircle2 className="h-3 w-3" /> Verified
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5 animate-pulse">
                                                    <AlertCircle className="h-3 w-3" /> Action Required
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>

                            <nav className="flex flex-col gap-2">
                                {[
                                    { id: 'profile' as const, label: 'Account Details', icon: UserIcon },
                                    { id: 'addresses' as const, label: 'Saved Addresses', icon: MapPin },
                                    { id: 'security' as const, label: 'Password & Security', icon: Shield },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-colors text-left ${activeTab === tab.id
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-700/50'
                                            }`}
                                    >
                                        <tab.icon className="h-5 w-5 flex-shrink-0" />
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>

                            <div className="border-t border-gray-100 dark:border-neutral-700 mt-6 pt-6">
                                <button
                                    onClick={() => { AuthService.logout(); window.location.href = '/login'; }}
                                    className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <LogOut className="h-5 w-5" /> Sign Out
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:w-3/4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'addresses' && (
                                    <div className="bg-white dark:bg-neutral-800 rounded-[2rem] border border-gray-100 dark:border-neutral-700 p-8 shadow-sm">
                                        <AddressBook />
                                    </div>
                                )}

                                {activeTab === 'profile' && (
                                    <AccountDetails />
                                )}

                                {activeTab === 'security' && (
                                    <div className="bg-white dark:bg-neutral-800 rounded-[2rem] border border-gray-100 dark:border-neutral-700 p-8 shadow-sm">
                                        <div className="max-w-md mx-auto py-10">
                                            <div className="text-center mb-8">
                                                <div className="h-20 w-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-lg shadow-primary/5">
                                                    <Lock className="h-10 w-10" />
                                                </div>
                                                <h3 className="text-3xl font-black text-gray-900 dark:text-white font-serif tracking-tight">Account Protection</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
                                                    For your privacy and security, password changes require a secure link sent to your registered email address.
                                                </p>
                                            </div>

                                            <div className="bg-neutral-light dark:bg-neutral-900/50 rounded-3xl p-6 mb-8 border border-gray-100 dark:border-neutral-700/50">
                                                <div className="flex items-start gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-white dark:bg-neutral-800 shadow-sm flex items-center justify-center flex-shrink-0">
                                                        <Mail className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Registered Email</p>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.email}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    // Navigate to forgot-password without logging out immediately
                                                    // We use window.location.href to ensure a clean refresh of the auth context
                                                    window.location.href = '/forgot-password';
                                                }}
                                                id="reset-btn"
                                                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-5 text-sm font-black text-white hover:bg-accent transition-all shadow-xl shadow-primary/20 hover:shadow-accent/40 hover:-translate-y-0.5 active:translate-y-0"
                                            >
                                                SECURE PASSWORD RESET <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                            </button>

                                            <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-8 font-medium leading-loose uppercase tracking-[0.2em]">
                                                Redirecting to Login after successful request
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
