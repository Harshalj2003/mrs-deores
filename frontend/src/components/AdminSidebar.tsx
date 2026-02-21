import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, FileText, Grid, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { clsx } from 'clsx';
import BrandLogo from './BrandLogo';

const AdminSidebar: React.FC = () => {
    const location = useLocation();
    const { theme, toggle: toggleTheme } = useTheme();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
        { id: 'categories', label: 'Categories', icon: Grid, path: '/admin/categories' },
        { id: 'orders', label: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
        { id: 'custom-orders', label: 'Custom Requests', icon: FileText, path: '/admin/custom-orders' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
    ];

    return (
        <div
            data-admin="sidebar"
            className="admin-sidebar w-64 flex flex-col h-screen sticky top-0"
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
                            className={clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium text-sm',
                                isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'hover:bg-primary/10 hover:text-primary'
                            )}
                            style={!isActive ? { color: 'var(--admin-nav-text)' } : {}}
                        >
                            <item.icon className={clsx('h-5 w-5 flex-shrink-0 transition-colors', isActive ? 'text-white' : 'group-hover:text-primary')} style={!isActive ? { color: 'var(--admin-nav-text)', opacity: 0.6 } : {}} />
                            <span>{item.label}</span>
                            {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/60" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 space-y-2" style={{ borderTop: '1px solid var(--admin-sidebar-border)' }}>
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-neutral-500/10"
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
                <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-red-500/10 hover:text-red-500" style={{ color: 'var(--admin-nav-text)' }}>
                    <LogOut className="h-5 w-5" style={{ opacity: 0.6 }} />
                    <span>Exit Admin</span>
                </Link>
            </div>
        </div>
    );
};

export default AdminSidebar;
