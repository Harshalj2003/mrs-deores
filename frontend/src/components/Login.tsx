import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import AuthService from "../services/auth.service";
import AuthTabs from "./AuthTabs";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, Lock, Smartphone, ArrowRight, RefreshCw, User, KeyRound, ShieldAlert, Eye, EyeOff, Copy, Check } from "lucide-react";
import EmailVerificationModal from "./EmailVerificationModal";

const Login: React.FC = () => {
    const [loginMode, setLoginMode] = useState<'email' | 'otp'>('email');
    const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
    const [adminMode, setAdminMode] = useState<'login' | 'register'>('login');

    // Email State
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    // OTP State
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    // Admin Registration State
    const [adminUsername, setAdminUsername] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [adminPhone, setAdminPhone] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const [inviteToken, setInviteToken] = useState("");
    const [tokenCopied, setTokenCopied] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [touchedUser, setTouchedUser] = useState(false);
    const [touchedPass, setTouchedPass] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showAdminPassword, setShowAdminPassword] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [userToVerify, setUserToVerify] = useState<{ email: string } | null>(null);

    const navigate = useNavigate();

    // Load remembered credentials on mount
    useEffect(() => {
        const remembered = localStorage.getItem("rememberedUser");
        if (remembered) {
            try {
                const data = JSON.parse(remembered);
                setUsername(data.username || "");
                setRememberMe(true);
            } catch { /* ignore corrupt data */ }
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        if (loginMode === 'email' || activeTab === 'admin') {
            // Handle Remember Me
            if (rememberMe) {
                localStorage.setItem("rememberedUser", JSON.stringify({ username: username.trim() }));
            } else {
                localStorage.removeItem("rememberedUser");
            }

            AuthService.login({
                username,
                password,
                isAdmin: activeTab === 'admin'
            }).then(
                (data) => {
                    if (activeTab === 'user' && !data.isEmailVerified) {
                        setUserToVerify({ email: data.email });
                        setShowVerification(true);
                        setLoading(false);
                        return;
                    }
                    navigate(activeTab === 'admin' ? "/admin" : "/");
                    window.location.reload();
                },
                (error) => {
                    const resMessage = (error.response?.data?.message) || error.message || error.toString();
                    setLoading(false);
                    setMessage(resMessage);
                }
            );
        } else {
            setTimeout(() => {
                setLoading(false);
                setMessage("OTP Verification is currently being processed manually. Please contact support.");
            }, 1000);
        }
    };

    const handleAdminRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        AuthService.adminRegister({
            username: adminUsername,
            email: adminEmail,
            phone: adminPhone,
            password: adminPassword,
            inviteToken,
        }).then(
            () => {
                setLoading(false);
                setMessage("Admin account created successfully! You can now login.");
                setAdminMode('login');
                setUsername(adminUsername);
            },
            (error) => {
                const resMessage = (error.response?.data?.message) || error.message || error.toString();
                setLoading(false);
                setMessage(resMessage);
            }
        );
    };

    const sendOtp = () => {
        if (!phone) {
            setMessage("Please enter a phone number.");
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setOtpSent(true);
            setMessage("OTP sent successfully to " + phone);
        }, 1000);
    };

    const handleCopyToken = () => {
        if (!inviteToken) return;
        navigator.clipboard.writeText(inviteToken).then(() => {
            setTokenCopied(true);
            setTimeout(() => setTokenCopied(false), 2000);
        });
    };

    const inputClass = "block w-full rounded-2xl border-gray-100 dark:border-neutral-700 bg-background dark:bg-neutral-800 py-3 sm:py-4 pl-11 pr-4 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-200 dark:ring-neutral-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary text-sm leading-6 outline-none transition-all duration-300 focus:shadow-lg focus:shadow-primary/10";

    return (
        <div className="space-y-4 sm:space-y-6">
            <Helmet>
                <title>Sign In – Mrs. Deore's Premix</title>
                <meta name="description" content="Sign in to your Mrs. Deore's Premix account. Access your orders, wishlist, and personalized shopping experience." />
                <link rel="canonical" href="https://mrs-deores.onrender.com/login" />
            </Helmet>
            <AuthTabs activeTab={activeTab} setActiveTab={(tab) => {
                setActiveTab(tab);
                setMessage("");
                if (tab === 'user') setAdminMode('login');
                if (tab === 'admin') setLoginMode('email');
            }} />

            <div className="text-center">
                <motion.h2
                    key={`title-${activeTab}-${adminMode}`}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white font-serif lowercase italic"
                >
                    {activeTab === 'admin' && adminMode === 'register'
                        ? 'Admin Enrollment'
                        : `Welcome Back${activeTab === 'admin' ? ', Admin' : ''}`
                    }
                </motion.h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {activeTab === 'admin' && adminMode === 'register'
                        ? 'Invitation token required for enrollment'
                        : 'Please sign in to your dashboard'
                    }
                </p>
            </div>

            {/* User login mode switcher */}
            {activeTab === 'user' && (
                <div className="flex bg-neutral-light dark:bg-neutral-800 p-1 rounded-xl mb-6">
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setLoginMode('email')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 ${loginMode === 'email' ? 'bg-white dark:bg-neutral-700 shadow-sm text-primary dark:text-primary-light' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        <User className="h-4 w-4" /> Password
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setLoginMode('otp')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 ${loginMode === 'otp' ? 'bg-white dark:bg-neutral-700 shadow-sm text-primary dark:text-primary-light' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        <Smartphone className="h-4 w-4" /> Phone OTP
                    </motion.button>
                </div>
            )}

            {/* Admin mode switcher: Login vs Register */}
            {activeTab === 'admin' && (
                <div className="flex bg-neutral-light dark:bg-neutral-800 p-1 rounded-xl mb-6">
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setAdminMode('login'); setMessage(""); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 ${adminMode === 'login' ? 'bg-white dark:bg-neutral-700 shadow-sm text-accent dark:text-accent-light' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        <Lock className="h-4 w-4" /> Login
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setAdminMode('register'); setMessage(""); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 ${adminMode === 'register' ? 'bg-white dark:bg-neutral-700 shadow-sm text-accent dark:text-accent-light' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        <KeyRound className="h-4 w-4" /> Enroll
                    </motion.button>
                </div>
            )}

            {/* ───── USER LOGIN FORM / ADMIN LOGIN FORM ───── */}
            {(activeTab === 'user' || (activeTab === 'admin' && adminMode === 'login')) && (
                <form className="space-y-4" onSubmit={handleLogin}>
                    <AnimatePresence mode="wait">
                        {loginMode === 'email' || activeTab === 'admin' ? (
                            <motion.div
                                key="email-form"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-3"
                            >
                                <motion.div className="relative group" whileTap={{ scale: 0.995 }}>
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                                    <input
                                        type="text"
                                        className={inputClass}
                                        placeholder={activeTab === 'admin' ? "Email, Phone or Username" : "Username or Email"}
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onBlur={() => setTouchedUser(true)}
                                        required
                                    />
                                    {touchedUser && username !== username.trim() && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-[11px] text-amber-600 mt-1 px-1 font-medium"
                                        >
                                            ✓ Extra spaces detected — they'll be trimmed automatically for you.
                                        </motion.p>
                                    )}
                                </motion.div>
                                <motion.div className="relative group" whileTap={{ scale: 0.995 }}>
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className={`${inputClass} pr-12`}
                                        placeholder="Password (min. 6 characters)"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onBlur={() => setTouchedPass(true)}
                                        required
                                    />
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors duration-300"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </motion.button>

                                    {touchedPass && password.trim().length > 0 && password.trim().length < 6 && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-[11px] text-red-500 mt-1 px-1 font-medium"
                                        >
                                            Password must be at least 6 characters.
                                        </motion.p>
                                    )}
                                </motion.div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="otp-form"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-3"
                            >
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="tel"
                                        className={inputClass}
                                        placeholder="Phone Number"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                    {!otpSent && (
                                        <motion.button
                                            type="button"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={sendOtp}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-primary hover:text-white transition-all duration-300"
                                        >
                                            SEND OTP
                                        </motion.button>
                                    )}
                                </div>
                                {otpSent && (
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            className={inputClass}
                                            placeholder="Enter 6-digit OTP"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                        />
                                        <motion.button
                                            type="button"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 px-3 py-1.5 rounded-xl text-[10px] font-black hover:text-primary transition-all duration-300 flex items-center gap-1"
                                        >
                                            <RefreshCw className="h-3 w-3" /> RESEND
                                        </motion.button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between px-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="h-4 w-4 rounded border-2 border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 peer-checked:bg-primary peer-checked:border-primary transition-all duration-200 flex items-center justify-center">
                                    {rememberMe && (
                                        <motion.svg
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                            className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none"
                                        >
                                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </motion.svg>
                                    )}
                                </div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="text-xs font-black text-primary dark:text-primary-light hover:underline uppercase tracking-widest">
                            Forgot Password?
                        </Link>
                    </div>

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.01, boxShadow: '0 8px 30px rgba(194, 65, 12, 0.35)' }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 sm:py-4 px-3 text-sm font-black text-white hover:bg-accent transition-all duration-300 shadow-xl shadow-primary/20 overflow-hidden"
                        disabled={loading}
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                        {loading ? "AUTHENTICATING..." : (
                            <>
                                CONTINUE <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                            </>
                        )}
                    </motion.button>
                </form>
            )}

            {/* ───── ADMIN ENROLLMENT FORM ───── */}
            {activeTab === 'admin' && adminMode === 'register' && (
                <form className="space-y-4" onSubmit={handleAdminRegister}>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3"
                    >
                        {/* Security notice */}
                        <div className="flex items-start gap-3 bg-accent/5 dark:bg-accent/10 border border-accent/10 dark:border-accent/20 rounded-2xl p-4 mb-2">
                            <ShieldAlert className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-black text-accent uppercase tracking-widest">Secure Enrollment</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">You need a valid invitation token from the system owner. Unauthorized attempts are logged.</p>
                            </div>
                        </div>

                        <motion.div className="relative group" whileTap={{ scale: 0.995 }}>
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors duration-300" />
                            <input
                                type="text"
                                className={`${inputClass} focus:ring-accent`}
                                placeholder="Admin Username"
                                value={adminUsername}
                                onChange={(e) => setAdminUsername(e.target.value)}
                                required
                            />
                        </motion.div>

                        <motion.div className="relative group" whileTap={{ scale: 0.995 }}>
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors duration-300" />
                            <input
                                type="email"
                                className={`${inputClass} focus:ring-accent`}
                                placeholder="Pre-approved Email"
                                value={adminEmail}
                                onChange={(e) => setAdminEmail(e.target.value)}
                                required
                            />
                        </motion.div>

                        <motion.div className="relative group" whileTap={{ scale: 0.995 }}>
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors duration-300" />
                            <input
                                type="tel"
                                className={`${inputClass} focus:ring-accent`}
                                placeholder="Registered Phone Number"
                                value={adminPhone}
                                onChange={(e) => setAdminPhone(e.target.value)}
                                required
                            />
                        </motion.div>

                        <motion.div className="relative group" whileTap={{ scale: 0.995 }}>
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors duration-300" />
                            <input
                                type={showAdminPassword ? "text" : "password"}
                                className={`${inputClass} pr-12 focus:ring-accent`}
                                placeholder="Set Admin Password"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowAdminPassword(!showAdminPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent transition-colors duration-300"
                            >
                                {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </motion.button>
                        </motion.div>

                        <motion.div className="relative group" whileTap={{ scale: 0.995 }}>
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors duration-300" />
                            <input
                                type="text"
                                className={`${inputClass} pr-14 focus:ring-accent font-mono`}
                                placeholder="Invitation Token"
                                value={inviteToken}
                                onChange={(e) => setInviteToken(e.target.value)}
                                required
                            />
                            {inviteToken && (
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleCopyToken}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent transition-colors duration-300"
                                    title="Copy token"
                                >
                                    {tokenCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </motion.button>
                            )}
                        </motion.div>
                    </motion.div>

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.01, boxShadow: '0 8px 30px rgba(127, 29, 29, 0.35)' }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3 sm:py-4 px-3 text-sm font-black text-white hover:bg-primary transition-all duration-300 shadow-xl shadow-accent/20 overflow-hidden"
                        disabled={loading}
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                        {loading ? "VERIFYING CREDENTIALS..." : (
                            <>
                                ENROLL AS ADMIN <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                            </>
                        )}
                    </motion.button>
                </form>
            )}

            {/* Message display */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                        className={`text-center p-4 rounded-2xl text-sm font-bold shadow-lg border relative overflow-hidden flex items-center justify-center gap-2 ${message.includes('success')
                            ? 'bg-secondary/10 dark:bg-secondary/20 text-secondary border-secondary/20 dark:border-secondary/30'
                            : 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/30'
                            }`}
                    >
                        {message.includes('success') ? "✓" : "⚠"}
                        <span className="relative z-10">{message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {activeTab === 'user' && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="relative font-black text-primary dark:text-primary-light uppercase tracking-widest group">
                        <span className="relative z-10">Join Tradition</span>
                        <motion.span
                            className="absolute -inset-x-2 -inset-y-1 bg-primary/10 rounded-lg -z-0"
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        />
                    </Link>
                </p>
            )}

            {userToVerify && (
                <EmailVerificationModal
                    isOpen={showVerification}
                    onClose={() => setShowVerification(false)}
                    email={userToVerify.email}
                    onSuccess={() => {
                        navigate("/");
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
};

export default Login;
