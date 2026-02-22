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
    const [announcementSettings, setAnnouncementSettings] = useState<{
        text: string;
        color: string;
        link: string;
        animation: string;
        height: 'sm' | 'md' | 'lg';
        width: 'full' | 'boxed';
    }>({
        text: '',
        color: '',
        link: '',
        animation: 'none',
        height: 'md',
        width: 'full'
    });
    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const cached = localStorage.getItem('siteSettings');
        if (cached) {
            try {
                const s = JSON.parse(cached);
                applySettings(s);
            } catch (e) { }
        }

        api.get('/settings').then(res => {
            const s = res.data || {};
            applySettings(s);
            localStorage.setItem('siteSettings', JSON.stringify(s));
        }).catch(() => { });
    }, []);

    const applySettings = (s: any) => {
        const enabled = s.announcement_enabled === 'true' || s.announcement_enabled === '1' || s.announcement_enabled === true;
        if (enabled && s.announcement_text) {
            setAnnouncementSettings({
                text: s.announcement_text,
                color: s.announcement_bg_color || '',
                link: s.announcement_link || '',
                animation: s.announcement_animation || 'none',
                height: (s.announcement_height as any) || 'md',
                width: (s.announcement_width as any) || 'full'
            });
            setShowAnnouncement(true);
        } else {
            setShowAnnouncement(false);
        }
    };

    const getHeightClass = () => {
        switch (announcementSettings.height) {
            case 'sm': return 'py-1 text-[9px]';
            case 'lg': return 'py-4 text-xs';
            default: return 'py-2.5 text-[10px]';
        }
    };

    const getAnimationProps = () => {
        switch (announcementSettings.animation) {
            case 'pulse':
                return {
                    animate: { opacity: [1, 0.5, 1] },
                    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const }
                };
            case 'bounce':
                return {
                    animate: { y: [0, -2, 0] },
                    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }
                };
            default:
                return {};
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Dynamic Announcement Bar */}
            <AnimatePresence>
                {showAnnouncement && !dismissed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={`z-50 relative ${announcementSettings.width === 'boxed' ? 'px-4 pt-4' : ''}`}
                    >
                        <motion.div
                            {...getAnimationProps()}
                            style={announcementSettings.color ? { backgroundColor: announcementSettings.color } : undefined}
                            className={`
                                ${announcementSettings.color ? '' : 'bg-primary'} 
                                text-white font-black uppercase tracking-[0.3em] relative flex items-center justify-center overflow-hidden
                                ${announcementSettings.width === 'boxed' ? 'rounded-2xl shadow-lg mx-auto max-w-7xl' : ''}
                                ${getHeightClass()}
                            `}
                        >
                            {/* Shine Effect Overlay */}
                            {announcementSettings.animation === 'shine' && (
                                <motion.div
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                                    className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
                                />
                            )}

                            {announcementSettings.animation === 'marquee' ? (
                                <div className="flex whitespace-nowrap overflow-hidden w-full">
                                    <motion.div
                                        animate={{ x: [0, '-50%'] }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="flex gap-20 pr-20"
                                    >
                                        <span>{announcementSettings.text}</span>
                                        <span>{announcementSettings.text}</span>
                                        <span>{announcementSettings.text}</span>
                                        <span>{announcementSettings.text}</span>
                                    </motion.div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 px-10">
                                    {announcementSettings.link ? (
                                        <a href={announcementSettings.link} className="hover:underline flex items-center gap-2">
                                            {announcementSettings.text}
                                        </a>
                                    ) : (
                                        <span>{announcementSettings.text}</span>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={() => setDismissed(true)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 z-10"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </motion.div>
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
