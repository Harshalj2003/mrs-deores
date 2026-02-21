import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';
import type { User } from '../types/auth.types';
import api from '../services/api';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import WhatsAppButton from '../components/WhatsAppButton';

interface MainLayoutProps {
    children: React.ReactNode;
    currentUser?: User;
    logOut: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, currentUser, logOut }) => {
    const [announcementText, setAnnouncementText] = useState('');
    const [announcementColor, setAnnouncementColor] = useState('');
    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        api.get('/settings').then(res => {
            const s = res.data || {};
            const enabled = s.announce_enabled === 'true' || s.announce_enabled === '1' || s.announce_enabled === true;
            if (enabled && s.announce_text) {
                setAnnouncementText(s.announce_text);
                setAnnouncementColor(s.announce_color || '');
                setShowAnnouncement(true);
            }
        }).catch(() => { });
    }, []);

    return (
        <div className="min-h-screen bg-background">
            {/* Dynamic Announcement Bar */}
            <AnimatePresence>
                {showAnnouncement && !dismissed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={announcementColor ? { backgroundColor: announcementColor } : undefined}
                        className={`${announcementColor ? '' : 'bg-primary'} text-white py-2 text-center text-[10px] font-black uppercase tracking-[0.3em] relative flex items-center justify-center`}
                    >
                        <span>{announcementText}</span>
                        <button
                            onClick={() => setDismissed(true)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <Navbar currentUser={currentUser} logOut={logOut} />

            <main className="container mx-auto px-4 py-8">
                {children}
            </main>

            <Footer />

            <CartDrawer />

            <WhatsAppButton />
        </div>
    );
};

export default MainLayout;
