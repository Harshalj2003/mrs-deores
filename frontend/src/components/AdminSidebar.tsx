import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import BrandLogo from './BrandLogo';

const AdminSidebar: React.FC = () => {
    const location = useLocation();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
        { id: 'orders', label: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
        { id: 'custom-orders', label: 'Custom Requests', icon: FileText, path: '/admin/custom-orders' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
    ];

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
            <div className="p-6 border-b border-gray-100 flex flex-col items-start gap-2">
                <BrandLogo variant="full" className="h-10" />
                <div className="text-[10px] text-primary uppercase tracking-widest font-black ml-1">Admin Portal</div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <Link
                        key={item.id}
                        to={item.path}
                        className={clsx(
                            "flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group",
                            location.pathname === item.path
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "text-gray-500 hover:bg-neutral-light hover:text-primary"
                        )}
                    >
                        <item.icon className={clsx("h-5 w-5", location.pathname === item.path ? "text-white" : "text-gray-400 group-hover:text-primary")} />
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <Link to="/" className="flex items-center space-x-3 p-3 text-gray-500 hover:text-red-500 transition-colors">
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Exit Admin</span>
                </Link>
            </div>
        </div>
    );
};

export default AdminSidebar;
