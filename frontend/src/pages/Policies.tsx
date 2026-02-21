import React, { useState, useEffect } from 'react';
import { Shield, FileText, Truck, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const Policies: React.FC = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'shipping'>('privacy');

    useEffect(() => {
        const path = location.pathname.split('/').pop();
        if (path === 'privacy' || path === 'terms' || path === 'shipping') {
            setActiveTab(path as any);
        }
    }, [location]);

    const tabs = [
        { id: 'privacy', label: 'Privacy Policy', icon: Shield, path: '/privacy' },
        { id: 'terms', label: 'Terms of Service', icon: FileText, path: '/terms' },
        { id: 'shipping', label: 'Shipping & Returns', icon: Truck, path: '/shipping' },
    ] as const;

    const renderContent = () => {
        switch (activeTab) {
            case 'privacy':
                return (
                    <motion.div key="privacy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white font-serif mb-8 flex items-center gap-4">
                            <Shield className="h-8 w-8 text-primary" /> Privacy Policy
                        </h2>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-neutral-400 space-y-6">
                            <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl inline-block font-black text-[10px] uppercase tracking-widest text-secondary mb-4">
                                Effective Date: February 21, 2026
                            </div>
                            <p className="text-lg leading-relaxed italic">At MRS. DEORE, your trust is our most valued tradition. We are committed to safeguarding the personal information you share with us.</p>

                            <section>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-10 mb-4">1. Information We Collect</h3>
                                <p>We collect information strictly necessary to provide our services, including:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Contact details (Name, Email, Phone Number) for order communication.</li>
                                    <li>Shipping Information for physical product delivery.</li>
                                    <li>Account credentials (encrypted) for persistent shopping sessions.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-10 mb-4">2. Secure Payments</h3>
                                <p>Transaction security is non-negotiable. We do not store your credit card or bank details on our servers. All payments are processed through Razorpay, utilizing industry-standard 128-bit encryption.</p>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-10 mb-4">3. Your Data Rights</h3>
                                <p>You have the full right to access, rectify, or delete your personal data. You may manage these settings through your Profile page or by contacting our support team via WhatsApp.</p>
                            </section>
                        </div>
                    </motion.div>
                );
            case 'terms':
                return (
                    <motion.div key="terms" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white font-serif mb-8 flex items-center gap-4">
                            <FileText className="h-8 w-8 text-primary" /> Terms of Service
                        </h2>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-neutral-400 space-y-6">
                            <p>By using the MRS. DEORE platform, you agree to comply with the following professional standards and terms.</p>

                            <section>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-10 mb-4">Product Representation</h3>
                                <p>We make every effort to display the colors and images of our products as accurately as possible. However, the actual appearance may vary slightly due to your device's display settings or natural variation in traditional food ingredients.</p>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-10 mb-4">Usage Restrictions</h3>
                                <p>The content on this website, including designs, recipes, branding, and images, is the intellectual property of MRS. DEORE. Unauthorized commercial use is strictly prohibited.</p>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-10 mb-4">Wholesale Tiers</h3>
                                <p>Bulk pricing is automatically applied at defined thresholds. These rates are subject to change based on raw material availability and seasonal demand.</p>
                            </section>
                        </div>
                    </motion.div>
                );
            case 'shipping':
                return (
                    <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white font-serif mb-8 flex items-center gap-4">
                            <Truck className="h-8 w-8 text-primary" /> Shipping & Returns
                        </h2>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-neutral-400 space-y-6">
                            <section>
                                <p className="text-lg leading-relaxed">We bring the taste of tradition from our home to yours. Here's how our logistics flow ensures freshness and quality.</p>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-10 mb-4">Fulfillment Timelines</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                                        <p className="font-bold text-primary mb-2">Processing</p>
                                        <p className="text-sm">Orders are fresh-packed and shipped within 24-48 business hours.</p>
                                    </div>
                                    <div className="p-6 bg-secondary/5 rounded-3xl border border-secondary/10">
                                        <p className="font-bold text-secondary mb-2">Delivery</p>
                                        <p className="text-sm">Standard shipping takes approx. 3-7 business days across India.</p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-10 mb-4">No-Question Returns (Damages Only)</h3>
                                <p>Due to the consumable nature of our products, we do not accept returns once a package is opened. However, if the seal is broken or the product is damaged during transit, we offer a 100% money-back guarantee or instant replacement. Please reach out on WhatsApp within 24 hours of delivery.</p>
                            </section>
                        </div>
                    </motion.div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-neutral-light dark:bg-neutral-950 pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:text-accent transition-all mb-8 group">
                    <div className="p-2 bg-white dark:bg-neutral-900 rounded-full shadow-sm group-hover:-translate-x-1 transition-transform">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                    Back to Storefront
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
                    {/* Sidebar Nav */}
                    <div className="lg:col-span-1 border-r border-gray-200 dark:border-neutral-800 pr-0 lg:pr-8 space-y-2 sticky top-32">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <Link
                                    key={tab.id}
                                    to={tab.path}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 font-bold text-sm group ${activeTab === tab.id
                                            ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105 z-10'
                                            : 'text-gray-500 dark:text-neutral-500 hover:bg-white dark:hover:bg-neutral-900'
                                        }`}
                                >
                                    <div className={`p-2 rounded-xl transition-colors ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-neutral-800'}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    {tab.label}
                                </Link>
                            );
                        })}

                        <div className="mt-12 p-8 bg-gradient-to-br from-secondary/5 to-accent/5 border border-secondary/10 rounded-[2rem] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full -mr-8 -mt-8 blur-2xl"></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-3">Transparency</p>
                            <p className="text-sm text-gray-600 dark:text-neutral-400 mb-6 leading-relaxed font-medium">Looking for something specific that's not listed here?</p>
                            <Link to="/home" className="text-sm font-black text-secondary hover:underline flex items-center gap-2 group">
                                Help Center <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3 bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 lg:p-16 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-neutral-800 relative min-h-[600px]">
                        <AnimatePresence mode="wait">
                            {renderContent()}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Policies;
