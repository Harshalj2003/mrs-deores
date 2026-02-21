import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthService from "../services/auth.service";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Phone, ShieldCheck, ArrowRight, Eye, EyeOff } from "lucide-react";

/* ───────────── Validation helpers ───────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(\+91|91|0)?[6-9]\d{9}$/;

const passwordStrength = (p: string): { label: string; width: string; color: string } => {
    if (p.length === 0) return { label: '', width: '0%', color: '' };
    if (p.length < 6) return { label: 'Too short', width: '25%', color: 'bg-red-500' };
    if (p.length < 8) return { label: 'Weak', width: '40%', color: 'bg-orange-400' };
    if (/[A-Z]/.test(p) && /\d/.test(p)) return { label: 'Strong', width: '100%', color: 'bg-green-500' };
    return { label: 'Medium', width: '65%', color: 'bg-yellow-500' };
};

const Hint: React.FC<{ show: boolean; error?: boolean; children: React.ReactNode }> = ({ show, error, children }) => (
    <AnimatePresence>
        {show && (
            <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`text-[11px] px-1 mt-1 font-medium ${error ? 'text-red-500' : 'text-amber-600 dark:text-amber-500'}`}
            >
                {children}
            </motion.p>
        )}
    </AnimatePresence>
);

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [successful, setSuccessful] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const blur = (field: string) => setTouched(t => ({ ...t, [field]: true }));

    // Derived validation
    const emailInvalid = touched.email && formData.email.length > 0 && !EMAIL_RE.test(formData.email);
    const phoneInvalid = touched.phone && formData.phone.length > 0 && !PHONE_RE.test(formData.phone.replace(/\s/g, ''));
    const passShort = touched.password && formData.password.length > 0 && formData.password.length < 6;
    const confirmMismatch = touched.confirmPassword && formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;
    const strength = passwordStrength(formData.password);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setSuccessful(false);

        if (formData.password !== formData.confirmPassword) {
            setMessage("Passwords do not match!");
            return;
        }
        if (!EMAIL_RE.test(formData.email)) {
            setMessage("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        AuthService.register({
            ...formData,
            username: formData.username.trim(),
            email: formData.email.trim(),
        }).then(
            (response) => {
                setMessage(response.data.message || "Registration successful! Please verify your email/phone.");
                setSuccessful(true);
                setLoading(false);
            },
            (error) => {
                const resMessage = (error.response?.data?.message) || error.message || error.toString();
                setLoading(false);
                setMessage(resMessage);
            }
        );
    };

    const inputClass = "block w-full rounded-2xl border-gray-100 dark:border-neutral-700 bg-background dark:bg-neutral-800 py-4 pl-12 pr-4 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-200 dark:ring-neutral-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 outline-none transition-all";

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white font-serif lowercase italic">Join Our Tradition</h2>
                <p className="text-sm text-gray-500 mt-1">Create an account to start your journey</p>
            </div>

            {!successful ? (
                <form className="space-y-4" onSubmit={handleRegister}>
                    <div className="space-y-3">
                        {/* Username */}
                        <div className="relative group">
                            <User className="absolute left-4 top-[18px] h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input name="username" type="text" className={inputClass}
                                placeholder="Full Name"
                                value={formData.username}
                                onChange={handleChange}
                                onBlur={() => blur('username')}
                                required />
                            <Hint show={!!(touched.username && formData.username !== formData.username.trim())}>
                                ✓ Extra spaces will be trimmed automatically.
                            </Hint>
                        </div>

                        {/* Email */}
                        <div className="relative group">
                            <Mail className="absolute left-4 top-[18px] h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input name="email" type="email" className={inputClass}
                                placeholder="Email Address (e.g. name@domain.com)"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={() => blur('email')}
                                required />
                            <Hint show={!!emailInvalid} error>
                                Please enter a valid email like name@domain.com
                            </Hint>
                        </div>

                        {/* Phone */}
                        <div className="relative group">
                            <Phone className="absolute left-4 top-[18px] h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input name="phone" type="tel" className={inputClass}
                                placeholder="Mobile Number (+91 XXXXXXXXXX)"
                                value={formData.phone}
                                onChange={handleChange}
                                onBlur={() => blur('phone')}
                                required />
                            <Hint show={!!phoneInvalid} error>
                                Enter a valid 10-digit Indian mobile number (e.g. +91 98765 43210)
                            </Hint>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-[18px] h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                <input name="password" type={showPassword ? 'text' : 'password'} className={`${inputClass} pr-12`}
                                    placeholder="Password (min. 6 characters)"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={() => blur('password')}
                                    required />
                                <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-4 top-[17px] text-gray-400 hover:text-primary transition-colors">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {/* Password strength bar */}
                            {formData.password.length > 0 && (
                                <div className="mt-1.5 px-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Strength</span>
                                        <span className={`text-[10px] font-bold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                                    </div>
                                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full rounded-full ${strength.color}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: strength.width }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </div>
                            )}
                            <Hint show={!!passShort} error>Password must be at least 6 characters.</Hint>
                        </div>

                        {/* Confirm Password */}
                        <div className="relative group">
                            <ShieldCheck className="absolute left-4 top-[18px] h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input name="confirmPassword" type={showPassword ? 'text' : 'password'} className={inputClass}
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onBlur={() => blur('confirmPassword')}
                                required />
                            <Hint show={!!confirmMismatch} error>Passwords don't match.</Hint>
                            <Hint show={!!(touched.confirmPassword && !confirmMismatch && formData.confirmPassword.length > 0)}>
                                ✓ Passwords match!
                            </Hint>
                        </div>
                    </div>

                    <div className="px-1">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-relaxed">
                            By signing up, you agree to our{' '}
                            <span className="text-primary dark:text-primary-light font-black">Terms of Service</span>{' '}
                            and <span className="text-primary dark:text-primary-light font-black">Privacy Policy</span>.
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 px-3 text-sm font-black text-white hover:bg-accent transition-all duration-300 shadow-xl shadow-primary/20 disabled:opacity-70"
                        disabled={loading || !!passShort || !!emailInvalid}
                    >
                        {loading ? "CREATING ACCOUNT..." : (
                            <>START JOURNEY <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>

                    {message && !successful && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center p-3 rounded-xl text-xs font-bold bg-accent/10 dark:bg-accent/20 text-accent dark:text-accent-light"
                        >
                            {message}
                        </motion.div>
                    )}

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        Already part of the family?{' '}
                        <Link to="/login" className="font-black text-primary dark:text-primary-light hover:underline uppercase tracking-widest">Sign In</Link>
                    </p>
                </form>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 space-y-6"
                >
                    <div className="h-20 w-20 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white font-serif">Account Created!</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 px-8">
                        Welcome! Your account for <span className="text-primary dark:text-primary-light font-bold">{formData.email}</span> is ready.
                    </p>
                    <Link to="/login"
                        className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-accent transition-all shadow-lg shadow-primary/20"
                    >
                        GO TO LOGIN <ArrowRight className="h-4 w-4" />
                    </Link>
                </motion.div>
            )}
        </div>
    );
};

export default Register;
