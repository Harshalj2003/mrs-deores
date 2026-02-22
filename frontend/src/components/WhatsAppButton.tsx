import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import React from 'react';
import api from '../services/api';

interface Settings {
    whatsapp_enabled: 'true' | 'false';
    whatsapp_number: string;
    whatsapp_message: string;
    whatsapp_position: 'left' | 'right';
    whatsapp_size: 'sm' | 'md' | 'lg';
    whatsapp_color?: string;
    whatsapp_icon_url?: string;
}

const WhatsAppButton: React.FC = () => {
    const [settings, setSettings] = React.useState<Settings | null>(null);

    React.useEffect(() => {
        const cached = localStorage.getItem('siteSettings');
        if (cached) {
            try { setSettings(JSON.parse(cached)); } catch (e) { }
        }

        api.get('/settings').then((res: { data: Settings }) => {
            setSettings(res.data);
            localStorage.setItem('siteSettings', JSON.stringify(res.data));
        }).catch(() => { });
    }, []);

    if (settings?.whatsapp_enabled === 'false') return null;

    const phoneNumber = settings?.whatsapp_number || "7038016741";
    const message = settings?.whatsapp_message || "Hello Mrs. Deores! I'm interested in your traditions. Could you help me with my order?";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    const isRight = settings?.whatsapp_position === 'right';
    const size = settings?.whatsapp_size || 'md';

    const sizeClasses = {
        sm: 'h-12 w-12',
        md: 'h-16 w-16',
        lg: 'h-20 w-20'
    };

    const iconSize = {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-10 w-10'
    };

    return (
        <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0, x: isRight ? 20 : -20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`fixed bottom-8 ${isRight ? 'right-8' : 'left-8'} z-[100] group flex items-center gap-3 ${isRight ? 'flex-row-reverse' : ''}`}
            aria-label="Contact support on WhatsApp"
        >
            <div className={`bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-all pointer-events-none ${isRight ? '-translate-x-4 group-hover:-translate-x-0' : 'translate-x-4 group-hover:translate-x-0'} hidden md:block`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">Instant Support</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">Chat on WhatsApp</p>
            </div>

            <div
                className={`${sizeClasses[size as keyof typeof sizeClasses]} text-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white dark:border-neutral-900 relative ring-1 ring-black/5 dark:ring-white/5`}
                style={{
                    backgroundColor: settings?.whatsapp_color || '#25D366',
                    boxShadow: `0 25px 50px -12px ${settings?.whatsapp_color || '#25D366'}66`
                }}
            >
                {settings?.whatsapp_icon_url ? (
                    <img
                        src={settings.whatsapp_icon_url}
                        alt="WhatsApp support"
                        className="w-[70%] h-[70%] object-contain rounded-full"
                        onError={(e) => {
                            // Fallback to MessageCircle if image fails to load
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'block';
                        }}
                    />
                ) : null}

                <MessageCircle
                    className={`${iconSize[size as keyof typeof iconSize]} fill-current text-white`}
                    style={{ display: settings?.whatsapp_icon_url ? 'none' : 'block' }}
                />

                <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-primary border-2 border-white dark:border-neutral-900 rounded-full animate-pulse shadow-sm z-10"></span>
            </div>
        </motion.a>
    );
};

export default WhatsAppButton;
