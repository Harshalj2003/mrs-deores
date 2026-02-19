import React from "react";
import { Link, useLocation } from "react-router-dom";
import type { User } from "../types/auth.types";
import { motion } from "framer-motion";
import useCartStore from "../store/useCartStore";
import { ShoppingBag, User as UserIcon, LogOut, Package } from "lucide-react";

interface NavbarProps {
    currentUser?: User;
    logOut: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentUser, logOut }) => {
    const location = useLocation();
    const cartItems = useCartStore((state) => state.items);
    const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const isAdmin = currentUser?.roles.includes("ROLE_ADMIN");

    const navItems = currentUser ? [
        { label: "My Orders", path: "/orders", icon: Package },
    ] : [
        { label: "Login", path: "/login", icon: UserIcon },
        { label: "Sign Up", path: "/register", icon: UserIcon },
    ];

    return (
        <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-gray-100 py-4">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <Link to={"/"} className="relative group">
                    <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-2xl font-black font-serif text-primary tracking-tighter"
                    >
                        MRS.DEORE's
                    </motion.span>
                    <motion.div
                        className="absolute -bottom-1 left-0 h-0.5 bg-secondary w-0 group-hover:w-full transition-all duration-300"
                    />
                </Link>

                <div className="flex items-center space-x-6">
                    <div className="hidden md:flex items-center space-x-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative group overflow-hidden"
                            >
                                <motion.span
                                    className={clsx(
                                        "text-xs font-black uppercase tracking-widest transition-colors duration-300",
                                        location.pathname === item.path ? "text-primary" : "text-gray-400 group-hover:text-primary"
                                    )}
                                >
                                    {item.label}
                                </motion.span>
                                {location.pathname === item.path && (
                                    <motion.div
                                        layoutId="nav-underline"
                                        className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary"
                                    />
                                )}
                            </Link>
                        ))}

                        {isAdmin && (
                            <Link to="/admin" className="px-4 py-1.5 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10 hover:bg-primary hover:text-white transition-all">
                                Admin Portal
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center space-x-4 border-l border-gray-100 pl-6 ml-6">
                        {currentUser && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={logOut}
                                className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                            </motion.button>
                        )}

                        <motion.div className="relative group">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-3 bg-neutral-light text-primary rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm"
                            >
                                <ShoppingBag className="h-5 w-5" />
                            </motion.button>
                            {itemCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white"
                                >
                                    {itemCount}
                                </motion.span>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

// Helper for conditional classes
function clsx(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}

export default Navbar;
