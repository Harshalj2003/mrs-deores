import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthService from "../services/auth.service";
import { motion } from "framer-motion";
import { User, Mail, Lock, Phone, ShieldCheck, ArrowRight } from "lucide-react";

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    const [successful, setSuccessful] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setSuccessful(false);

        if (formData.password !== formData.confirmPassword) {
            setMessage("Passwords do not match!");
            return;
        }

        setLoading(true);
        AuthService.register(formData).then(
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

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-black text-gray-900 font-serif lowercase italic">
                    Join Our Tradition
                </h2>
                <p className="text-sm text-gray-500 mt-1">Create an account to start your journey</p>
            </div>

            {!successful ? (
                <form className="space-y-4" onSubmit={handleRegister}>
                    <div className="space-y-3">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input
                                name="username"
                                type="text"
                                className="block w-full rounded-2xl border-gray-100 bg-background py-4 pl-12 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 outline-none transition-all"
                                placeholder="Full Name"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input
                                name="email"
                                type="email"
                                className="block w-full rounded-2xl border-gray-100 bg-background py-4 pl-12 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 outline-none transition-all"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input
                                name="phone"
                                type="tel"
                                className="block w-full rounded-2xl border-gray-100 bg-background py-4 pl-12 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 outline-none transition-all"
                                placeholder="Phone Number"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input
                                name="password"
                                type="password"
                                className="block w-full rounded-2xl border-gray-100 bg-background py-4 pl-12 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 outline-none transition-all"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="relative group">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input
                                name="confirmPassword"
                                type="password"
                                className="block w-full rounded-2xl border-gray-100 bg-background py-4 pl-12 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 outline-none transition-all"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="px-1">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                            By signing up, you agree to our <span className="text-primary font-black">Terms of Service</span> and <span className="text-primary font-black">Privacy Policy</span>.
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 px-3 text-sm font-black text-white hover:bg-accent transition-all duration-300 shadow-xl shadow-primary/20"
                        disabled={loading}
                    >
                        {loading ? "CREATING ACCOUNT..." : (
                            <>
                                START JOURNEY <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    {message && !successful && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center p-3 rounded-xl text-xs font-bold bg-accent/10 text-accent"
                        >
                            {message}
                        </motion.div>
                    )}

                    <p className="text-center text-sm text-gray-500">
                        Already part of the family?{' '}
                        <Link to="/login" className="font-black text-primary hover:underline uppercase tracking-widest">
                            Sign In
                        </Link>
                    </p>
                </form>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 space-y-6"
                >
                    <div className="h-20 w-20 bg-secondary/20 text-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 font-serif">Registration Sent!</h3>
                    <p className="text-sm text-gray-500 px-8">
                        We've sent a verification link to <span className="text-primary font-bold">{formData.email}</span>. Please verify your account to continue.
                    </p>
                    <Link
                        to="/login"
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
