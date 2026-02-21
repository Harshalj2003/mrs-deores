import React from 'react';
import AdminSidebar from '../components/AdminSidebar';
import type { User } from '../types/auth.types';

interface AdminLayoutProps {
    children: React.ReactNode;
    currentUser?: User;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-neutral-light">
            <AdminSidebar />
            <main className="flex-1 p-8 overflow-hidden">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
