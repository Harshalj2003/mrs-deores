import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, AlertTriangle, AlertCircle, Info, Image as ImageIcon, Video, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { clsx } from 'clsx';

interface NotificationItem {
    id: number;
    title: string;
    message: string;
    type: string;
    createdAt: string;
    isRead: boolean;
    isGlobal: boolean;
    attachmentUrl?: string;
    attachmentType?: string;
    senderUsername?: string;
}

export default function NotificationDropdown() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        fetchNotifications();

        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Optionally poll or refresh when opening
    useEffect(() => {
        if (open) {
            fetchNotifications();
        }
    }, [open]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.notifications || []);
        } catch (err) {
            // User might not be logged in or error
        }
    };

    const markAsRead = async (id: number) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        try {
            await api.post(`/notifications/${id}/read`);
        } catch (err) {
            console.error(err);
        }
    };

    const handleNotificationClick = (notif: NotificationItem) => {
        if (!notif.isRead) markAsRead(notif.id);
        setSelectedNotif(notif);
        setOpen(false);
    };

    const getTypeIcon = (t: string) => {
        switch (t) {
            case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'WARNING': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
            case 'ALERT': return <AlertCircle className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setOpen(!open)}
                className="p-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-2xl transition-all duration-300 shadow-sm relative focus:outline-none"
            >
                <Bell className="h-5 w-5" />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            key="bell-badge"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black h-4.5 w-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden z-[100] flex flex-col"
                    >
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
                            <h3 className="font-bold text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>

                        <div className="overflow-y-auto max-h-[400px]">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-zinc-400 flex flex-col items-center">
                                    <Bell className="w-10 h-10 mb-2 opacity-20" />
                                    <p className="text-sm">You have no notifications.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            onClick={() => handleNotificationClick(notif)}
                                            className={clsx(
                                                "p-4 flex gap-3 cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 max-w-full group",
                                                !notif.isRead ? "bg-primary/5 dark:bg-primary/10" : ""
                                            )}
                                        >
                                            <div className="flex-shrink-0 mt-1">
                                                {getTypeIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2 mb-1">
                                                    <h4 className={clsx(
                                                        "text-sm tracking-tight truncate",
                                                        !notif.isRead ? "font-bold text-zinc-900 dark:text-gray-100" : "font-semibold text-zinc-700 dark:text-gray-400"
                                                    )}>
                                                        {notif.title}
                                                    </h4>
                                                    <span className="text-[10px] text-zinc-400 whitespace-nowrap flex-shrink-0">
                                                        {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <p className={clsx(
                                                    "text-xs leading-relaxed line-clamp-2",
                                                    !notif.isRead ? "text-zinc-700 dark:text-zinc-300 font-medium" : "text-zinc-500 dark:text-zinc-500"
                                                )}>
                                                    {notif.message}
                                                </p>
                                                {notif.attachmentType && notif.attachmentType !== 'NONE' && (
                                                    <div className="flex items-center gap-1.5 mt-2.5 text-primary/80 dark:text-primary/70 font-bold text-[10px] uppercase tracking-wider bg-primary/5 dark:bg-primary/10 w-fit px-2 py-1 rounded-md">
                                                        {notif.attachmentType === 'IMAGE' && <><ImageIcon className="w-3 h-3" /> Photo Attached</>}
                                                        {notif.attachmentType === 'VIDEO' && <><Video className="w-3 h-3" /> Video Attached</>}
                                                        {notif.attachmentType === 'LINK' && <><LinkIcon className="w-3 h-3" /> Link Attached</>}
                                                    </div>
                                                )}
                                            </div>
                                            {!notif.isRead && (
                                                <div className="flex-shrink-0 self-center">
                                                    <span className="h-2 w-2 rounded-full bg-primary block shadow-[0_0_8px_var(--color-primary)]"></span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-center">
                            <button
                                onClick={() => setOpen(false)}
                                className="text-xs font-bold text-primary hover:underline"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Expanded Notification Modal */}
            <AnimatePresence>
                {selectedNotif && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedNotif(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-[90vw] sm:max-w-lg bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 flex flex-col max-h-[85vh] sm:max-h-[90vh]"
                        >
                            <div className="p-5 sm:p-6 md:p-8 flex-shrink-0">
                                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                                    <div className="flex-shrink-0">
                                        {getTypeIcon(selectedNotif.type)}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-lg sm:text-xl font-bold font-serif text-zinc-900 dark:text-white leading-tight truncate">
                                            {selectedNotif.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1 text-[10px] sm:text-xs font-medium text-zinc-500 truncate">
                                            <span>{new Date(selectedNotif.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                            {selectedNotif.senderUsername && (
                                                <>
                                                    <span>•</span>
                                                    <span className="truncate">From: @{selectedNotif.senderUsername}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-xs sm:text-sm whitespace-pre-wrap max-h-[150px] sm:max-h-none overflow-y-auto custom-scrollbar pr-2">
                                    {selectedNotif.message}
                                </div>
                            </div>

                            {/* Media Attachment Area */}
                            {selectedNotif.attachmentUrl && selectedNotif.attachmentType !== 'NONE' && (
                                <div className="bg-zinc-50 dark:bg-black/20 border-t border-zinc-100 dark:border-zinc-800 p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-shrink">
                                    {selectedNotif.attachmentType === 'IMAGE' && (
                                        <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800">
                                            <img src={selectedNotif.attachmentUrl} alt="Attachment" className="w-full h-auto object-cover max-h-[200px] sm:max-h-[300px]" />
                                        </div>
                                    )}
                                    {selectedNotif.attachmentType === 'VIDEO' && (
                                        <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 bg-black flex justify-center">
                                            <video src={selectedNotif.attachmentUrl} controls className="w-full h-auto max-w-full max-h-[200px] sm:max-h-[300px] object-contain" />
                                        </div>
                                    )}
                                    {selectedNotif.attachmentType === 'LINK' && (
                                        <a
                                            href={selectedNotif.attachmentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed border-primary/30 rounded-xl sm:rounded-2xl hover:bg-primary/5 transition-all w-full text-center"
                                        >
                                            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-2 sm:mb-3">
                                                <LinkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                                            </div>
                                            <span className="font-bold text-sm sm:text-base text-primary group-hover:underline">Open Attached Link</span>
                                            <span className="text-[10px] sm:text-xs text-zinc-500 mt-1 truncate max-w-[150px] sm:max-w-[200px]">{selectedNotif.attachmentUrl}</span>
                                        </a>
                                    )}
                                </div>
                            )}

                            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end flex-shrink-0">
                                <button
                                    onClick={() => setSelectedNotif(null)}
                                    className="px-6 py-2.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold text-sm hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
