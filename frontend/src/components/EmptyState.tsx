import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionPath?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, actionLabel, actionPath }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-3xl border border-gray-100 shadow-sm text-center"
        >
            <div className="bg-primary/5 p-6 rounded-full mb-6 relative">
                <Icon className="w-12 h-12 text-primary" strokeWidth={1.5} />
                <motion.div
                    className="absolute inset-0 bg-primary/10 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <h3 className="text-xl font-black font-serif text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 max-w-xs mb-8 text-sm leading-relaxed">{description}</p>

            {actionLabel && actionPath && (
                <Link
                    to={actionPath}
                    className="bg-primary text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-secondary transition-colors shadow-lg shadow-primary/20"
                >
                    {actionLabel}
                </Link>
            )}
        </motion.div>
    );
};

export default EmptyState;
