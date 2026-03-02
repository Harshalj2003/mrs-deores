import React, { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { Menu } from 'lucide-react';
import type { User } from '../types/auth.types';
import BrandLogo from '../components/BrandLogo';
import NotificationDropdown from '../components/NotificationDropdown';

interface AdminLayoutProps {
    children: React.ReactNode;
    currentUser?: User;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-neutral-light overflow-hidden">
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="flex items-center gap-3 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <span className="font-serif font-black text-primary tracking-tight text-lg mt-0.5">
                            ADMIN
                        </span>
                        <div className="h-4 w-px bg-gray-300"></div>
                        <BrandLogo size="sm" />
                    </div>

                    <div className="flex items-center gap-2 relative z-50">
                        <NotificationDropdown />
                    </div>
                </header>

                {/* Desktop Top Right Header (Notifications) */}
                <div className="hidden md:flex justify-end items-center px-8 py-4 sticky top-0 bg-transparent z-40 pointer-events-none">
                    <div className="pointer-events-auto">
                        <NotificationDropdown />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:px-8 md:pb-8 pb-32 -mt-10 md:-mt-16">
                    <div className="pt-8 md:pt-4">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
