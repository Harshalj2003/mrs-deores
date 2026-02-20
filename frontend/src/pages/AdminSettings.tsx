import React from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { Settings, Save, Bell, Shield, Mail, Globe, Lock } from 'lucide-react';

const AdminSettings: React.FC = () => {
    return (
        <div className="flex min-h-screen bg-neutral-light font-sans">
            <AdminSidebar />
            <main className="flex-1 p-10">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-10">
                        <h1 className="text-3xl font-black text-gray-900 font-serif mb-2">Platform Settings</h1>
                        <p className="text-gray-500">Manage global configurations and administrative preferences.</p>
                    </header>

                    <div className="space-y-6">
                        {/* General Settings */}
                        <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                    <Globe className="h-5 w-5" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">General Configuration</h2>
                            </div>

                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Store Name</label>
                                    <input type="text" defaultValue="Mrs. Deore's Premixes" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Support Email</label>
                                    <input type="email" defaultValue="support@mrsdeore.com" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                            </div>
                        </section>

                        {/* Security */}
                        <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm opacity-75">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Security & Access (Coming Soon)</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div>
                                        <h3 className="font-bold text-gray-900">Maintenance Mode</h3>
                                        <p className="text-xs text-gray-500">Temporarily disable the storefront</p>
                                    </div>
                                    <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-not-allowed">
                                        <div className="absolute left-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm"></div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="flex justify-end pt-4">
                            <button className="flex items-center px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-accent transition-all shadow-lg shadow-primary/20">
                                <Save className="h-5 w-5 mr-2" /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminSettings;
