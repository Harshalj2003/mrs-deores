import React from 'react';
import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';
import type { User } from '../types/auth.types';

interface MainLayoutProps {
    children: React.ReactNode;
    currentUser?: User;
    logOut: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, currentUser, logOut }) => {
    return (
        <div className="min-h-screen bg-background">
            {/* Free Delivery Banner */}
            <div className="bg-primary text-white py-2 text-center text-[10px] font-black uppercase tracking-[0.3em]">
                Free Delivery for all products 🚚
            </div>

            <Navbar currentUser={currentUser} logOut={logOut} />

            <main className="container mx-auto px-4 py-8">
                {children}
            </main>

            <Footer />

            <CartDrawer />
        </div>
    );
};

export default MainLayout;
