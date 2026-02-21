import React from 'react';
import { clsx } from 'clsx';
import { User, ShieldCheck } from 'lucide-react';

interface AuthTabsProps {
    activeTab: 'user' | 'admin';
    setActiveTab: (tab: 'user' | 'admin') => void;
}

const AuthTabs: React.FC<AuthTabsProps> = ({ activeTab, setActiveTab }) => {
    return (
        <div className="flex p-1 bg-background dark:bg-neutral-900 rounded-2xl mb-8 border border-primary/10 dark:border-neutral-700">
            <button
                onClick={() => setActiveTab('user')}
                className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-black transition-all duration-300",
                    activeTab === 'user'
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-gray-400 hover:text-primary hover:bg-white dark:hover:bg-neutral-800"
                )}
            >
                <User className="h-4 w-4" />
                USER LOGIN
            </button>
            <button
                onClick={() => setActiveTab('admin')}
                className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-black transition-all duration-300",
                    activeTab === 'admin'
                        ? "bg-accent text-white shadow-lg shadow-accent/20"
                        : "text-gray-400 hover:text-accent hover:bg-white dark:hover:bg-neutral-800"
                )}
            >
                <ShieldCheck className="h-4 w-4" />
                ADMIN PORTAL
            </button>
        </div>
    );
};

export default AuthTabs;
