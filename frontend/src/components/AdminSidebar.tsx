import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, FileText, Grid, Sun, Moon, UserPlus, Bell } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { clsx } from 'clsx';
import BrandLogo from './BrandLogo';
import { getAdminPendingCustomOrdersCount } from '../services/CustomOrderService';

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen = false, onClose }) => {
    const location = useLocation();
    const { theme, toggle: toggleTheme } = useTheme();
    const [pendingOrders, setPendingOrders] = useState(0);

    useEffect(() => {
        getAdminPendingCustomOrdersCount().then(setPendingOrders).catch(() => { });
    }, [location.pathname]); // Refresh count when navigation happens

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
        { id: 'categories', label: 'Categories', icon: Grid, path: '/admin/categories' },
        { id: 'orders', label: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
        { id: 'custom-orders', label: 'Custom Requests', icon: FileText, path: '/admin/custom-orders', badge: pendingOrders },
        { id: 'notifications', label: 'Notifications', icon: Bell, path: '/admin/notifications' },
        { id: 'team', label: 'Invite Team', icon: UserPlus, path: '/admin/team' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
    ];

    return (
        <div
            data-admin="sidebar"
            className={clsx(
                "admin-sidebar w-64 flex flex-col h-[100dvh] transition-all duration-300 z-50 fixed",
                "md:sticky md:top-0 md:opacity-100 md:pointer-events-auto", // Desktop doesn't need translate-y changes
                isOpen ? "translate-x-0 shadow-2xl left-0 opacity-100 pointer-events-auto" : "-translate-x-full md:translate-x-0 left-0 opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto"
            )}
            style={{ backgroundColor: 'var(--admin-sidebar-bg)', borderRight: '1px solid var(--admin-sidebar-border)' }}
        >
            <div
                className="p-6 flex flex-col items-start gap-2"
                style={{ borderBottom: '1px solid var(--admin-sidebar-border)' }}
            >
                <BrandLogo variant="full" size="sm" showText={true} />
                <div className="text-[10px] text-primary uppercase tracking-widest font-black ml-1 opacity-80">Admin Portal</div>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            onClick={() => onClose?.()}
                            className={clsx(
                                'flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group font-medium text-sm relative min-h-[48px]',
                                isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'hover:bg-primary/10 hover:text-primary'
                            )}
                            style={!isActive ? { color: 'var(--admin-nav-text)' } : {}}
                        >
                            <item.icon className={clsx('h-5 w-5 flex-shrink-0 transition-colors', isActive ? 'text-white' : 'group-hover:text-primary')} style={!isActive ? { color: 'var(--admin-nav-text)', opacity: 0.6 } : {}} />
                            <span>{item.label}</span>
                            {item.badge ? (
                                <span className={clsx(
                                    "ml-auto text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm",
                                    isActive ? "bg-white text-primary" : "bg-red-500 text-white"
                                )}>
                                    {item.badge > 99 ? '99+' : item.badge}
                                </span>
                            ) : (
                                isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/60" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 space-y-2" style={{ borderTop: '1px solid var(--admin-sidebar-border)' }}>
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="flex w-full items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all hover:bg-neutral-500/10 min-h-[48px]"
                    style={{ color: 'var(--admin-nav-text)' }}
                >
                    {theme === 'dark' ? (
                        <>
                            <Sun className="h-5 w-5" style={{ opacity: 0.6 }} />
                            <span>Light Mode</span>
                        </>
                    ) : (
                        <>
                            <Moon className="h-5 w-5" style={{ opacity: 0.6 }} />
                            <span>Dark Mode</span>
                        </>
                    )}
                </button>

                {/* Exit */}
                <Link to="/" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all hover:bg-red-500/10 hover:text-red-500 min-h-[48px]" style={{ color: 'var(--admin-nav-text)' }}>
                    <LogOut className="h-5 w-5" style={{ opacity: 0.6 }} />
                    <span>Exit Admin</span>
                </Link>
            </div>
        </div>
    );
};

export default AdminSidebar;
