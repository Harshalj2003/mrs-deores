import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Loader2, CheckCircle2, RefreshCcw } from 'lucide-react';
import AuthService from '../services/auth.service';

interface EmailVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    onSuccess?: () => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({ isOpen, onClose, email, onSuccess }) => {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    useEffect(() => {
        if (isOpen) {
            // Auto-focus first input when modal opens
            setTimeout(() => inputRefs[0].current?.focus(), 100);
        }
    }, [isOpen]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);
        setError('');

        if (value && index < 3) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const handleVerify = async () => {
        const fullOtp = otp.join('');
        if (fullOtp.length < 4) {
            setError('Please enter all 4 digits.');
            return;
        }

        setVerifying(true);
        setError('');
        try {
            await AuthService.verifyEmail(email, fullOtp);
            setSuccess(true);
            setTimeout(() => {
                onSuccess?.();
                onClose();
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid or expired OTP.');
            setOtp(['', '', '', '']);
            inputRefs[0].current?.focus();
        } finally {
            setVerifying(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        setLoading(true);
        try {
            await AuthService.resendOtp(email);
            setResendTimer(120); // 2 mins cooldown
            setError('New OTP sent to your email.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border border-white/20"
            >
                <div className="p-8 text-center relative">
                    {!success && (
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-400" />
                        </button>
                    )}

                    <AnimatePresence mode="wait">
                        {!success ? (
                            <motion.div
                                key="verify"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                            >
                                <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <ShieldCheck className="h-8 w-8 text-primary" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white font-serif mb-2">Verify Email</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                                    We've sent a 4-digit code to <br />
                                    <span className="font-bold text-gray-900 dark:text-gray-200">{email}</span>
                                </p>

                                <div className="flex justify-center gap-3 mb-8">
                                    {otp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            ref={inputRefs[idx]}
                                            type="text"
                                            value={digit}
                                            onChange={(e) => handleChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(idx, e)}
                                            className="w-14 h-16 text-center text-2xl font-black bg-gray-50 dark:bg-neutral-800 border-2 border-gray-100 dark:border-neutral-700 rounded-2xl focus:border-primary focus:ring-0 outline-none transition-all dark:text-white"
                                            maxLength={1}
                                        />
                                    ))}
                                </div>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`text-xs font-bold mb-6 ${error.includes('sent') ? 'text-green-500' : 'text-red-500'}`}
                                    >
                                        {error}
                                    </motion.p>
                                )}

                                <button
                                    onClick={handleVerify}
                                    disabled={verifying}
                                    className="w-full bg-primary py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/30 hover:bg-accent transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {verifying ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Verification'}
                                </button>

                                <button
                                    onClick={handleResend}
                                    disabled={loading || resendTimer > 0}
                                    className="mt-6 text-xs font-black text-gray-400 hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                                >
                                    <RefreshCcw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                                    {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Did not receive? Resend'}
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-8"
                            >
                                <motion.div
                                    initial={{ y: 20 }}
                                    animate={{ y: 0 }}
                                    transition={{ type: "spring", damping: 10 }}
                                    className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
                                >
                                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                                </motion.div>
                                <motion.h2
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-2xl font-black text-gray-900 dark:text-white font-serif mb-2"
                                >
                                    Verification Successful!
                                </motion.h2>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="mt-4"
                                >
                                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Welcome to</p>
                                    <p className="text-xl font-black text-primary font-serif uppercase tracking-tighter">Mrs. Deore's Kitchen</p>
                                </motion.div>

                                {/* Branded product carousel loading — like Ajio but with our products */}
                                <div className="mt-8 flex flex-col items-center gap-3">
                                    <div className="overflow-hidden w-44 relative">
                                        <motion.div
                                            animate={{ x: ['0%', '-50%'] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                            className="flex gap-4 w-max"
                                        >
                                            {/* Product icons — doubled for seamless infinite loop */}
                                            {['🫙', '📦', '🌿', '🥣', '🍯', '🫙', '📦', '🌿', '🥣', '🍯'].map((icon, i) => (
                                                <motion.span
                                                    key={i}
                                                    animate={{ y: [0, -4, 0] }}
                                                    transition={{
                                                        duration: 1.2,
                                                        repeat: Infinity,
                                                        delay: i * 0.15,
                                                        ease: 'easeInOut'
                                                    }}
                                                    className="text-2xl flex-shrink-0"
                                                >
                                                    {icon}
                                                </motion.span>
                                            ))}
                                        </motion.div>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="w-28 h-1 rounded-full bg-gray-200 dark:bg-neutral-700 overflow-hidden">
                                        <motion.div
                                            initial={{ width: '0%' }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 2.8, ease: 'easeInOut' }}
                                            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-widest">
                                        Setting up your kitchen...
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default EmailVerificationModal;
