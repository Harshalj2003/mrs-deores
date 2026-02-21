import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { User } from "../types/auth.types";
import { motion, AnimatePresence } from "framer-motion";
import useCartStore from "../store/useCartStore";
import {
    ShoppingBag,
    LogOut,
    Package,
    Home,
    ChevronDown,
    Clipboard,
    Settings,
    User as UserIcon,
    Sun,
    Moon,
    Globe
} from "lucide-react";
import BrandLogo from "./BrandLogo";
import { clsx } from "clsx";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage, LANGUAGES } from "../contexts/LanguageContext";
import SearchBar from "./SearchBar";

import api from "../services/api";

interface NavbarProps {
    currentUser?: User;
    logOut: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentUser, logOut }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggle: toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const { currentLang, setLanguage, t } = useLanguage();
    const [langOpen, setLangOpen] = useState(false);
    const langRef = useRef<HTMLDivElement>(null);
    const cartItems = useCartStore((state) => state.items);
    const openCart = useCartStore((state) => state.openCart);
    const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Branding settings
    const [logoSize, setLogoSize] = useState<'sm' | 'md' | 'lg'>('md');

    useEffect(() => {
        api.get('/settings').then(res => {
            const s = res.data || {};
            if (s.brand_logo_size) setLogoSize(s.brand_logo_size as 'sm' | 'md' | 'lg');
        }).catch(() => { });
    }, []);

    const isAdmin = currentUser?.roles.includes("ROLE_ADMIN");

    const navItems = [
        { label: t('home'), path: "/", icon: Home },
        { label: t('customOrder'), path: "/custom-order", icon: Clipboard },
        ...(currentUser
            ? [{ label: t('myOrders'), path: "/orders", icon: Package }]
            : [
                { label: t('login'), path: "/login", icon: null },
                { label: t('signUp'), path: "/register", icon: null },
            ]),
    ];

    const profileMenuItems = [
        { label: 'My Profile', path: "/profile", icon: UserIcon },
        { label: t('myOrders'), path: "/orders", icon: Package },
        { label: t('customOrder'), path: "/custom-order", icon: Clipboard },
    ];

    // Close profile dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleLogOut = () => {
        setProfileOpen(false);
        logOut();
        navigate("/");
    };

    const avatarLetter = currentUser?.username?.charAt(0)?.toUpperCase() || "U";

    return (
        <nav className="sticky top-0 z-[100] bg-gradient-to-r from-[#FFF8E7] via-white to-[#FFF8E7] backdrop-blur-xl border-b border-primary/10 shadow-sm shadow-primary/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

                {/* Logo */}
                <Link to="/" className="flex items-center flex-shrink-0">
                    <BrandLogo size={logoSize} />
                </Link>

                {/* Center Nav Links — Desktop */}
                <div className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "relative px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-200",
                                location.pathname === item.path
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-500 hover:bg-primary/5 hover:text-primary"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}

                    {isAdmin && (
                        <Link
                            to="/admin"
                            className="ml-2 px-4 py-1.5 bg-accent text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-sm"
                        >
                            {t('adminPortal')}
                        </Link>
                    )}
                </div>

                {/* Right: Theme Toggle + Cart + User */}
                <div className="flex items-center gap-2 sm:gap-3">

                    {/* Theme Toggle */}
                    <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={toggleTheme}
                        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        className="hidden md:flex p-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-2xl transition-all duration-300 shadow-sm overflow-hidden"
                    >
                        <AnimatePresence mode="wait">
                            {isDark ? (
                                <motion.div
                                    key="sun"
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <Sun className="h-5 w-5" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="moon"
                                    initial={{ rotate: 90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: -90, opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <Moon className="h-5 w-5" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>

                    {/* Language Switcher */}
                    <div ref={langRef} className="relative hidden md:block">
                        <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => setLangOpen(v => !v)}
                            title={currentLang.nativeName}
                            className="p-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-2xl transition-all duration-300 shadow-sm flex items-center gap-1"
                        >
                            <span className="text-base leading-none">{currentLang.flag}</span>
                            <Globe className="h-3.5 w-3.5" />
                        </motion.button>
                        <AnimatePresence>
                            {langOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 py-2"
                                >
                                    <p className="px-4 py-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 mb-1">🌐 {t('changeLanguage')}</p>
                                    {LANGUAGES.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                                            className={clsx(
                                                'w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors',
                                                currentLang.code === lang.code
                                                    ? 'bg-primary/10 text-primary font-bold'
                                                    : 'text-gray-600 hover:bg-gray-50 font-medium'
                                            )}
                                        >
                                            <span className="text-base">{lang.flag}</span>
                                            <span className="font-bold">{lang.nativeName}</span>
                                            <span className="text-[10px] text-gray-400 ml-auto">{lang.name}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Smart Search */}
                    <div className={clsx(!currentUser ? "hidden md:block" : "block")}>
                        <SearchBar mode="compact" />
                    </div>

                    {/* Cart Button */}
                    <motion.div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={openCart}
                            className="p-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-2xl transition-all duration-300 shadow-sm"
                        >
                            <ShoppingBag className="h-5 w-5" />
                        </motion.button>
                        <AnimatePresence>
                            {itemCount > 0 && (
                                <motion.span
                                    key="cart-badge"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className="absolute -top-1.5 -right-1.5 bg-secondary text-white text-[9px] font-black h-4.5 w-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white"
                                >
                                    {itemCount}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Profile / Auth Area */}
                    {currentUser ? (
                        <div ref={profileRef} className="relative">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setProfileOpen((v) => !v)}
                                className="flex items-center gap-2 py-1.5 pl-1.5 pr-3 rounded-full bg-white border border-primary/15 shadow-sm hover:border-primary/30 transition-all"
                            >
                                {/* Avatar circle */}
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-black text-sm">
                                    {avatarLetter}
                                </div>
                                {/* Name — visible on md+ */}
                                <span className="hidden md:block text-xs font-black text-gray-700 max-w-[80px] truncate">
                                    {currentUser.username}
                                </span>
                                <ChevronDown
                                    className={clsx(
                                        "h-3.5 w-3.5 text-gray-400 transition-transform duration-200",
                                        profileOpen ? "rotate-180" : ""
                                    )}
                                />
                            </motion.button>

                            <AnimatePresence>
                                {profileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                                    >
                                        {/* Profile header */}
                                        <div className="px-4 py-3 bg-gradient-to-br from-[#FFF8E7] to-white border-b border-gray-100">
                                            <p className="text-sm font-black text-gray-900">{currentUser.username}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                                {isAdmin ? "Administrator" : "Member"}
                                            </p>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="py-1.5">
                                            {profileMenuItems.map((item) => (
                                                <Link
                                                    key={item.path}
                                                    to={item.path}
                                                    onClick={() => setProfileOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-primary/5 hover:text-primary transition-colors"
                                                >
                                                    <item.icon className="h-4 w-4 text-primary/60" />
                                                    {item.label}
                                                </Link>
                                            ))}
                                            {isAdmin && (
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setProfileOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-primary/5 hover:text-primary transition-colors"
                                                >
                                                    <Settings className="h-4 w-4 text-primary/60" />
                                                    {t('adminPortal')}
                                                </Link>
                                            )}
                                        </div>

                                        {/* Mobile Options (Theme & Lang) */}
                                        <div className="md:hidden border-t border-gray-100 py-1.5 space-y-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-primary/5 hover:text-primary transition-colors"
                                            >
                                                {isDark ? <Sun className="h-4 w-4 text-primary/60" /> : <Moon className="h-4 w-4 text-primary/60" />}
                                                {isDark ? 'Light Mode' : 'Dark Mode'}
                                            </button>

                                            <button
                                                onClick={(e) => { e.stopPropagation(); setLangOpen(v => !v); }}
                                                className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-600 hover:bg-primary/5 hover:text-primary transition-colors"
                                            >
                                                <span className="flex items-center gap-3">
                                                    <Globe className="h-4 w-4 text-primary/60" />
                                                    Language
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{currentLang.code}</span>
                                            </button>

                                            <AnimatePresence>
                                                {langOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="bg-gray-50/50 overflow-hidden"
                                                    >
                                                        {LANGUAGES.map(lang => (
                                                            <button
                                                                key={lang.code}
                                                                onClick={(e) => { e.stopPropagation(); setLanguage(lang.code); setLangOpen(false); setProfileOpen(false); }}
                                                                className={clsx(
                                                                    'w-full flex items-center gap-2.5 px-4 pl-11 py-1.5 text-xs transition-colors',
                                                                    currentLang.code === lang.code ? 'text-primary font-bold' : 'text-gray-500'
                                                                )}
                                                            >
                                                                {lang.nativeName}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Logout */}
                                        <div className="border-t border-gray-100 py-1.5">
                                            <button
                                                onClick={handleLogOut}
                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                {t('logout')}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className="px-4 py-2 text-xs font-black text-primary uppercase tracking-widest hover:bg-primary/5 rounded-xl transition-all"
                            >
                                {t('login')}
                            </Link>
                            <Link
                                to="/register"
                                className="px-4 py-2 text-xs font-black text-white bg-primary hover:bg-accent rounded-xl shadow-sm shadow-primary/20 transition-all"
                            >
                                {t('signUp')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
