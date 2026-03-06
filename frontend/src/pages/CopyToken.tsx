import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Copy, ShieldCheck, ArrowRight } from 'lucide-react';

const CopyToken: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            handleCopy(token);
        } else {
            setError('No token found in the link.');
        }
    }, [token]);

    const handleCopy = async (textToCopy: string) => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(textToCopy);
            } else {
                // Fallback for older browsers or non-secure contexts
                const textarea = document.createElement('textarea');
                textarea.value = textToCopy;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            setCopied(true);
        } catch (err) {
            console.error('Failed to copy token:', err);
            setError('Failed to auto-copy the token. Please select and copy it manually.');
        }
    };

    return (
        <div className="flex flex-col items-center text-center space-y-6 pt-2">
            <div className="space-y-1">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Admin Team Invitation</p>
                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">Verify to Enroll</h2>
            </div>

            {error ? (
                <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-6 rounded-2xl border border-red-200 dark:border-red-500/20 w-full mb-4">
                    <p className="font-semibold text-sm">{error}</p>
                    {token && (
                        <code className="block mt-4 p-3 rounded-xl bg-white dark:bg-neutral-950 text-xs font-mono break-all border border-red-100 dark:border-red-500/20">
                            {token}
                        </code>
                    )}
                </div>
            ) : (
                <div className="w-full relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20 blur-xl rounded-full opacity-50"></div>
                    <div className="relative bg-green-50 dark:bg-green-500/10 rounded-3xl p-6 sm:p-8 border border-green-200/50 dark:border-green-500/30 flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                            className="h-14 w-14 sm:h-16 sm:w-16 bg-white dark:bg-neutral-800 rounded-full shadow-lg shadow-green-500/10 flex items-center justify-center mb-5"
                        >
                            {copied ? (
                                <Check className="h-7 w-7 sm:h-8 sm:w-8 text-green-500" />
                            ) : (
                                <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8 text-green-500" />
                            )}
                        </motion.div>

                        <h2 className="text-lg sm:text-xl font-bold text-green-900 dark:text-green-400 mb-2">
                            {copied ? 'Copied to Clipboard!' : 'Your Token'}
                        </h2>
                        <p className="text-xs sm:text-sm text-green-700/80 dark:text-green-500/80 mb-5">
                            {copied
                                ? "The invitation token has been copied. You can now proceed to enrollment."
                                : "Here is your exclusive invitation token."}
                        </p>

                        <div className="w-full p-4 bg-white dark:bg-neutral-950 rounded-2xl border border-green-100 dark:border-green-500/30 shadow-sm relative group">
                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-green-800/40 dark:text-green-500/40 mb-2 absolute -top-2 left-4 bg-white dark:bg-neutral-950 px-2 transition-opacity">TOKEN</p>
                            <code className="text-[10px] sm:text-[11px] font-mono font-medium text-neutral-800 dark:text-neutral-300 break-all select-all">
                                {token}
                            </code>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full space-y-3 pt-4">
                <button
                    onClick={() => navigate(`/login?enroll=true${token ? `&token=${token}` : ''}`)}
                    className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-white text-xs sm:text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group"
                >
                    Proceed to Enrollment <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {token && !copied && !error && (
                    <button
                        onClick={() => handleCopy(token)}
                        className="w-full py-3 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-[11px] sm:text-xs font-bold uppercase tracking-widest rounded-2xl border border-neutral-200 dark:border-neutral-700 transition-all flex items-center justify-center gap-2"
                    >
                        <Copy className="h-4 w-4" /> Copy Again
                    </button>
                )}
            </div>
        </div>
    );
};

export default CopyToken;
