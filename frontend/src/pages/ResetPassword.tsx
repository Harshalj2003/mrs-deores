import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const passwordStrength = (p: string) => {
    if (p.length === 0) return { label: '', width: '0%', color: '' };
    if (p.length < 6) return { label: 'Too short', width: '25%', color: 'bg-red-500' };
    if (p.length < 8) return { label: 'Weak', width: '40%', color: 'bg-orange-400' };
    if (/[A-Z]/.test(p) && /\d/.test(p)) return { label: 'Strong', width: '100%', color: 'bg-green-500' };
    return { label: 'Medium', width: '65%', color: 'bg-yellow-500' };
};

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const strength = passwordStrength(newPassword);

    if (!token) {
        return (
            <div className="min-h-screen bg-background dark:bg-neutral-900 flex items-center justify-center p-4">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Invalid Reset Link</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This link is missing a reset token.</p>
                    <Link to="/forgot-password" className="mt-4 inline-block text-primary dark:text-primary-light font-bold text-sm hover:underline">Request a new link →</Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
        if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/reset-password', { token, newPassword });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'This link is invalid or has expired.';
            setError(msg);
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
                            <Lock className="h-8 w-8 text-primary dark:text-primary-light" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white font-serif">Set New Password</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Choose a strong password for your account.</p>
                    </div>

                    <div className="p-8">
                        <AnimatePresence mode="wait">
                            {!success ? (
                                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-4">
                                    {/* New Password */}
                                    <div className="space-y-1">
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type={showNew ? 'text' : 'password'}
                                                value={newPassword}
                                                onChange={e => { setNewPassword(e.target.value); setError(''); }}
                                                placeholder="New password"
                                                className="block w-full rounded-2xl border-gray-100 dark:border-neutral-700 bg-background dark:bg-neutral-800 py-4 pl-12 pr-12 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-200 dark:ring-neutral-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary outline-none transition-all text-sm"
                                                required
                                            />
                                            <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {/* Strength bar */}
                                        {newPassword.length > 0 && (
                                            <div className="space-y-1 px-1">
                                                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                                                </div>
                                                <p className={`text-[10px] font-bold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                                            placeholder="Confirm new password"
                                            className="block w-full rounded-2xl border-gray-100 dark:border-neutral-700 bg-background dark:bg-neutral-800 py-4 pl-12 pr-12 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-200 dark:ring-neutral-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary outline-none transition-all text-sm"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 px-1">
                                            <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                                            <p className="text-xs text-red-500 font-medium">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-black text-white hover:bg-accent transition-all shadow-xl shadow-primary/20 disabled:opacity-70"
                                    >
                                        {loading
                                            ? <><Loader2 className="h-4 w-4 animate-spin" /> Resetting...</>
                                            : <>Reset Password <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                                        }
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                                    <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-lg">Password Reset!</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Redirecting you to login in 3 seconds...</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-6 text-center">
                            <Link to="/login" className="inline-flex items-center gap-2 text-xs font-black text-primary dark:text-primary-light uppercase tracking-widest hover:text-accent dark:hover:text-accent-light transition-colors">
                                <ArrowLeft className="h-3 w-3" /> Back to Login
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPassword;
