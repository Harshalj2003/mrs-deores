import React, { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { Menu } from 'lucide-react';
import type { User } from '../types/auth.types';
import BrandLogo from '../components/BrandLogo';

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

                    <div className="w-8"></div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 md:pb-8 pb-32">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
