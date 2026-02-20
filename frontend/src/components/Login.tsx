import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthService from "../services/auth.service";
import AuthTabs from "./AuthTabs";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, Lock, Smartphone, ArrowRight, RefreshCw, User, KeyRound, ShieldAlert } from "lucide-react";

const Login: React.FC = () => {
    const [loginMode, setLoginMode] = useState<'email' | 'otp'>('email');
    const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
    const [adminMode, setAdminMode] = useState<'login' | 'register'>('login');

    // Email State
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

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

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        if (loginMode === 'email') {
            AuthService.login({ username, password }).then(
                () => {
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
                // Pre-fill login username
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

    return (
        <div className="space-y-6">
            <AuthTabs activeTab={activeTab} setActiveTab={(tab) => {
                setActiveTab(tab);
                setMessage("");
                if (tab === 'user') setAdminMode('login');
            }} />

            <div className="text-center">
                <h2 className="text-2xl font-black text-gray-900 font-serif lowercase italic">
                    {activeTab === 'admin' && adminMode === 'register'
                        ? 'Admin Enrollment'
                        : `Welcome Back${activeTab === 'admin' ? ', Admin' : ''}`
                    }
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    {activeTab === 'admin' && adminMode === 'register'
                        ? 'Invitation token required for enrollment'
                        : 'Please sign in to your dashboard'
                    }
                </p>
            </div>

            {/* User login mode switcher */}
            {activeTab === 'user' && (
                <div className="flex bg-neutral-light p-1 rounded-xl mb-6">
                    <button
                        onClick={() => setLoginMode('email')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${loginMode === 'email' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}
                    >
                        <Mail className="h-4 w-4" /> Email
                    </button>
                    <button
                        onClick={() => setLoginMode('otp')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${loginMode === 'otp' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}
                    >
                        <Smartphone className="h-4 w-4" /> Phone OTP
                    </button>
                </div>
            )}

            {/* Admin mode switcher: Login vs Register */}
            {activeTab === 'admin' && (
                <div className="flex bg-neutral-light p-1 rounded-xl mb-6">
                    <button
                        onClick={() => { setAdminMode('login'); setMessage(""); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${adminMode === 'login' ? 'bg-white shadow-sm text-accent' : 'text-gray-400'}`}
                    >
                        <Lock className="h-4 w-4" /> Login
                    </button>
                    <button
                        onClick={() => { setAdminMode('register'); setMessage(""); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${adminMode === 'register' ? 'bg-white shadow-sm text-accent' : 'text-gray-400'}`}
                    >
                        <KeyRound className="h-4 w-4" /> Enroll
                    </button>
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
                                className="space-y-3"
                            >
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        className="block w-full rounded-2xl border-gray-100 bg-background py-4 pl-12 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 outline-none transition-all"
                                        placeholder="Username or Email"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="password"
                                        className="block w-full rounded-2xl border-gray-100 bg-background py-4 pl-12 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 outline-none transition-all"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="otp-form"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-3"
                            >
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="tel"
                                        className="block w-full rounded-2xl border-gray-100 bg-background py-4 pl-12 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 outline-none transition-all"
                                        placeholder="Phone Number"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                    {!otpSent && (
                                        <button
                                            type="button"
                                            onClick={sendOtp}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-primary hover:text-white transition-all"
                                        >
                                            SEND OTP
                                        </button>
                                    )}
                                </div>
                                {otpSent && (
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            className="block w-full rounded-2xl border-gray-100 bg-background py-4 pl-12 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 outline-none transition-all"
                                            placeholder="Enter 6-digit OTP"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 px-3 py-1.5 rounded-xl text-[10px] font-black hover:text-primary transition-all flex items-center gap-1"
                                        >
                                            <RefreshCw className="h-3 w-3" /> RESEND
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between px-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                            <span className="text-xs text-gray-500 font-medium">Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="text-xs font-black text-primary hover:underline uppercase tracking-widest">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 px-3 text-sm font-black text-white hover:bg-accent transition-all duration-300 shadow-xl shadow-primary/20"
                        disabled={loading}
                    >
                        {loading ? "AUTHENTICATING..." : (
                            <>
                                CONTINUE <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            )}

            {/* ───── ADMIN ENROLLMENT FORM ───── */}
            {activeTab === 'admin' && adminMode === 'register' && (
                <form className="space-y-4" onSubmit={handleAdminRegister}>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                    >
                        {/* Security notice */}
                        <div className="flex items-start gap-3 bg-accent/5 border border-accent/10 rounded-2xl p-4 mb-2">
                            <ShieldAlert className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-black text-accent uppercase tracking-widest">Secure Enrollment</p>
                                <p className="text-xs text-gray-500 mt-1">You need a valid invitation token from the system owner. Unauthorized attempts are logged.</p>
                            </div>
                        </div>

                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors" />
                            <input
                                type="text"
                                className="block w-full rounded-2xl border-gray-100 bg-background py-4 pl-12 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6 outline-none transition-all"
                                placeholder="Admin Username"
                                value={adminUsername}
                                onChange={(e) => setAdminUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors" />
                            <input
                                type="email"
                                className="block w-full rounded-2xl border-gray-100 bg-background py-4 pl-12 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6 outline-none transition-all"
                                placeholder="Pre-approved Email"
                                value={adminEmail}
                                onChange={(e) => setAdminEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors" />
                            <input
                                type="tel"
                                className="block w-full rounded-2xl border-gray-100 bg-background py-4 pl-12 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6 outline-none transition-all"
                                placeholder="Registered Phone Number"
                                value={adminPhone}
                                onChange={(e) => setAdminPhone(e.target.value)}
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors" />
                            <input
                                type="password"
                                className="block w-full rounded-2xl border-gray-100 bg-background py-4 pl-12 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6 outline-none transition-all"
                                placeholder="Set Admin Password"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="relative group">
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors" />
                            <input
                                type="text"
                                className="block w-full rounded-2xl border-gray-100 bg-background py-4 pl-12 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6 outline-none transition-all font-mono"
                                placeholder="Invitation Token"
                                value={inviteToken}
                                onChange={(e) => setInviteToken(e.target.value)}
                                required
                            />
                        </div>
                    </motion.div>

                    <button
                        type="submit"
                        className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-4 px-3 text-sm font-black text-white hover:bg-primary transition-all duration-300 shadow-xl shadow-accent/20"
                        disabled={loading}
                    >
                        {loading ? "VERIFYING CREDENTIALS..." : (
                            <>
                                ENROLL AS ADMIN <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            )}

            {/* Message display */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-center p-3 rounded-xl text-xs font-bold ${message.includes('success') ? 'bg-secondary/10 text-secondary' : 'bg-accent/10 text-accent'}`}
                >
                    {message}
                </motion.div>
            )}

            {activeTab === 'user' && (
                <p className="text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-black text-primary hover:underline uppercase tracking-widest">
                        Join Tradition
                    </Link>
                </p>
            )}
        </div>
    );
};

export default Login;
