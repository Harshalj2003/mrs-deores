import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) { setError('Please enter your email address.'); return; }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) { setError('Please enter a valid email address (e.g. name@domain.com).'); return; }

        setLoading(true);
        setError('');
        try {
            await api.post('/auth/forgot-password', { email: email.trim() });
            setSent(true);
        } catch (err: any) {
            // Even on error, show success to prevent email enumeration
            setSent(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background dark:bg-neutral-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-neutral-800 rounded-3xl shadow-xl border border-gray-100 dark:border-neutral-700 overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-8 pb-0 text-center">
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
                            <Mail className="h-8 w-8 text-primary dark:text-primary-light" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white font-serif">Forgot Password?</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No worries! Enter your email and we'll send you a reset link.</p>
                    </div>

                    <div className="p-8">
                        <AnimatePresence mode="wait">
                            {!sent ? (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => { setEmail(e.target.value); setError(''); }}
                                            placeholder="your@email.com"
                                            className="block w-full rounded-2xl border-gray-100 dark:border-neutral-700 bg-background dark:bg-neutral-800 py-4 pl-12 pr-4 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-200 dark:ring-neutral-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary outline-none transition-all text-sm"
                                            required
                                        />
                                    </div>

                                    {error && (
                                        <p className="text-xs text-red-500 font-medium px-1">{error}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-black text-white hover:bg-accent transition-all shadow-xl shadow-primary/20 disabled:opacity-70"
                                    >
                                        {loading
                                            ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                                            : <>Send Reset Link <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                                        }
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center space-y-4"
                                >
                                    <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">Check your inbox!</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            If <span className="font-bold text-primary dark:text-primary-light">{email}</span> is registered, you'll receive a reset link within a few minutes.
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">Didn't get it? Check spam, or try again in 5 minutes.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-6 text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-xs font-black text-primary dark:text-primary-light uppercase tracking-widest hover:text-accent dark:hover:text-accent-light transition-colors"
                            >
                                <ArrowLeft className="h-3 w-3" /> Back to Login
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
