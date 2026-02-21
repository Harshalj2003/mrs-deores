import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { User as UserIcon, MapPin, Settings as SettingsIcon, Shield, LogOut } from 'lucide-react';
import type { User } from '../types/auth.types';
import AuthService from '../services/auth.service';
import AddressBook from '../components/AddressBook';
import { motion, AnimatePresence } from 'framer-motion';

const ProfilePage: React.FC = () => {
    const user: User | null = AuthService.getCurrentUser();
    const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'security'>('addresses');

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="bg-neutral-light dark:bg-neutral-900 min-h-screen pt-24 pb-20">
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
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white font-serif leading-none">{user.username}</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
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
                                    <div className="bg-white dark:bg-neutral-800 rounded-[2rem] border border-gray-100 dark:border-neutral-700 p-8 shadow-sm flex flex-col items-center justify-center text-center h-[50vh]">
                                        <SettingsIcon className="h-16 w-16 text-gray-300 dark:text-neutral-700 mb-4" />
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white font-serif mb-2">Account Overview</h3>
                                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">View your lifetime order stats, update your email preferences, and manage personal data.</p>
                                        <button disabled className="bg-gray-100 dark:bg-neutral-700 text-gray-400 dark:text-gray-500 px-6 py-3 rounded-xl font-bold cursor-not-allowed">Coming Soon</button>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="bg-white dark:bg-neutral-800 rounded-[2rem] border border-gray-100 dark:border-neutral-700 p-8 shadow-sm flex flex-col items-center justify-center text-center h-[50vh]">
                                        <Shield className="h-16 w-16 text-gray-300 dark:text-neutral-700 mb-4" />
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white font-serif mb-2">Password Configuration</h3>
                                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">Update your password or configure two-factor authentication.</p>
                                        <Link to="/forgot-password" className="text-primary hover:text-accent font-bold underline underline-offset-4">Reset Password Now</Link>
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
