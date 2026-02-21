import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import AddressList from '../components/AddressList';
import useCartStore from '../store/useCartStore';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AuthService from '../services/auth.service';
import { CreditCard, CheckCircle, ChevronRight, Lock, MapPin, CreditCard as CardIcon, Tag, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from "clsx";

interface AppliedCoupon {
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
}

const CheckoutPage: React.FC = () => {
    const { items, clearCart } = useCartStore();
    const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Success
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [orderId, setOrderId] = useState<number | null>(null);
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [paymentSubFlow, setPaymentSubFlow] = useState<'CHOICE' | 'UPI_ID' | 'WAITING' | 'SUCCESS'>('CHOICE');
    const [upiId, setUpiId] = useState('');
    const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'SUCCESS' | 'FAILED'>('IDLE');
    const navigate = useNavigate();

    const getTotalPrice = () => {
        return items.reduce((acc, item) => {
            const price = item.product.bulkPrice && item.quantity >= item.product.bulkMinQuantity
                ? item.product.bulkPrice
                : item.product.sellingPrice;
            return acc + (price * item.quantity);
        }, 0);
    };

    const totalPrice = getTotalPrice();
    const finalAmount = appliedCoupon ? Math.max(0, totalPrice - appliedCoupon.discountAmount) : totalPrice;
    const user = AuthService.getCurrentUser();

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponError(null);
        try {
            const res = await api.get(`/coupons/validate?code=${couponCode}&orderTotal=${totalPrice}`);
            setAppliedCoupon(res.data);
            setCouponCode('');
        } catch (err: any) {
            setCouponError(err.response?.data?.message || "Invalid coupon code.");
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponError(null);
    };

    const logOut = () => {
        AuthService.logout();
        navigate('/login');
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-neutral-light flex flex-col items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-12 rounded-[3rem] shadow-xl text-center max-w-md"
                >
                    <Lock className="h-16 w-16 text-primary mx-auto mb-6" />
                    <h2 className="text-3xl font-black font-serif text-gray-900 mb-4">Secured Experience</h2>
                    <p className="text-gray-500 mb-8 font-medium">Please sign in to your MRS.DEORE account to complete your traditional selection.</p>
                    <button onClick={() => navigate('/login')} className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-accent transition-colors">Sign In</button>
                </motion.div>
            </div>
        );
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const handleUpiVerification = async () => {
        if (!upiId.includes('@')) {
            alert("Invalid UPI ID format.");
            return;
        }
        setIsVerifyingUpi(true);
        // Simulate real-time verification
        await new Promise(r => setTimeout(r, 2000));
        setIsVerifyingUpi(false);
        setPaymentSubFlow('WAITING');

        // Simulate payment listening
        setTimeout(() => {
            setPaymentStatus('SUCCESS');
            setStep(3); // Go to success receipt
            clearCart();
        }, 3000);
    };

    const handleAppLaunch = (appId: string) => {
        setPaymentSubFlow('WAITING');
        // Simulate successful redirect/payment
        setTimeout(() => {
            setStep(3);
            clearCart();
        }, 3500);
    };

    return (
        <div className="min-h-screen bg-neutral-light pb-20">
            <Navbar currentUser={user} logOut={logOut} />

            <div className="container mx-auto px-6 py-12 max-w-7xl">
                <AnimatePresence mode="wait">
                    {step !== 3 ? (
                        <motion.div
                            key="checkout-form"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-12"
                        >
                            <div className="lg:col-span-8 space-y-8">
                                <header className="mb-12">
                                    <h1 className="text-5xl font-serif font-black text-gray-900 mb-2">Checkout</h1>
                                    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-gray-400">
                                        <span className={step === 1 ? "text-primary border-b-2 border-primary pb-1" : ""}>01. Delivery</span>
                                        <ChevronRight className="h-4 w-4" />
                                        <span className={step === 2 ? "text-primary border-b-2 border-primary pb-1" : ""}>02. Payment</span>
                                        <ChevronRight className="h-4 w-4" />
                                        <span>03. Completion</span>
                                    </div>
                                </header>

                                <motion.div
                                    variants={itemVariants}
                                    className={clsx(
                                        "bg-white p-10 rounded-[3rem] shadow-sm transition-all duration-500",
                                        step === 1 ? "ring-4 ring-primary/5" : "opacity-40 grayscale pointer-events-none"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center">
                                                <MapPin className="h-6 w-6" />
                                            </div>
                                            <h2 className="text-2xl font-black font-serif">Delivery Address</h2>
                                        </div>
                                    </div>

                                    {step === 1 && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                            <AddressList
                                                selectedAddressId={selectedAddressId || undefined}
                                                onSelectAddress={setSelectedAddressId}
                                            />
                                            {selectedAddressId && (
                                                <div className="mt-10 flex justify-end">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setStep(2)}
                                                        className="px-10 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-accent transition-colors"
                                                    >
                                                        Confirm & Continue
                                                    </motion.button>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </motion.div>

                                <motion.div
                                    variants={itemVariants}
                                    className={clsx(
                                        "bg-white p-10 rounded-[3rem] shadow-sm transition-all duration-500",
                                        step === 2 ? "ring-4 ring-primary/5" : "opacity-40 grayscale pointer-events-none"
                                    )}
                                >
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="h-12 w-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center">
                                            <CardIcon className="h-6 w-6" />
                                        </div>
                                        <h2 className="text-2xl font-black font-serif">Payment Method</h2>
                                    </div>

                                    {step === 2 && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                            {paymentSubFlow === 'CHOICE' && (
                                                <div className="space-y-8">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {[
                                                            { id: 'gpay', name: 'Google Pay', icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Pay_Logo_%282020%29.svg' },
                                                            { id: 'phonepe', name: 'PhonePe', icon: 'https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg' },
                                                            { id: 'paytm', name: 'Paytm', icon: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg' },
                                                            { id: 'amazon', name: 'Amazon Pay', icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' }
                                                        ].map(app => (
                                                            <button
                                                                key={app.id}
                                                                onClick={() => handleAppLaunch(app.id)}
                                                                className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-3xl hover:bg-primary/5 hover:ring-2 hover:ring-primary/20 transition-all border border-transparent"
                                                            >
                                                                <img src={app.icon} alt={app.name} className="h-8 object-contain" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{app.name}</span>
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div className="relative">
                                                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
                                                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]"><span className="bg-white px-4 text-gray-300">OR PAY VIA UPI ID</span></div>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <input
                                                            type="text"
                                                            value={upiId}
                                                            onChange={e => setUpiId(e.target.value)}
                                                            placeholder="example@okaxis"
                                                            className="flex-1 px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 font-bold placeholder:text-gray-300 uppercase"
                                                        />
                                                        <button
                                                            onClick={setPaymentSubFlow.bind(null, 'UPI_ID')}
                                                            className="px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                                                        >
                                                            Enter UPI ID
                                                        </button>
                                                    </div>

                                                    <div className="pt-6 border-t border-gray-50 flex justify-between items-center text-xs font-black uppercase tracking-widest text-gray-300">
                                                        <button onClick={() => setStep(1)} className="hover:text-primary">Back to Delivery</button>
                                                        <div className="flex items-center gap-4">
                                                            <span>Secured by</span>
                                                            <div className="h-5 flex items-center gap-2 grayscale opacity-30">
                                                                <CreditCard className="h-4 w-4" /> <span className="text-[8px]">NPCI / UPI 2.0</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {paymentSubFlow === 'UPI_ID' && (
                                                <div className="text-center py-10 space-y-8">
                                                    <div className="space-y-2">
                                                        <h3 className="text-2xl font-serif font-black text-gray-900">Review UPI ID</h3>
                                                        <p className="text-sm text-gray-400 font-medium">We will send a payment request to this ID</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-6 rounded-3xl inline-block border-2 border-primary/10">
                                                        <span className="text-2xl font-black text-primary tracking-widest uppercase">{upiId}</span>
                                                    </div>
                                                    <div className="flex justify-center gap-4">
                                                        <button onClick={() => setPaymentSubFlow('CHOICE')} className="px-10 py-4 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-primary">Cancel</button>
                                                        <button
                                                            onClick={handleUpiVerification}
                                                            disabled={isVerifyingUpi}
                                                            className="px-12 py-5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-accent transition-all flex items-center gap-3 disabled:opacity-50"
                                                        >
                                                            {isVerifyingUpi ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                                                            {isVerifyingUpi ? 'Verifying NPCI...' : 'Verify & Send Request'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {paymentSubFlow === 'WAITING' && (
                                                <div className="text-center py-20 space-y-10">
                                                    <div className="relative inline-block">
                                                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
                                                        <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center relative shadow-lg">
                                                            <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <h3 className="text-4xl font-serif font-black text-gray-900">Waiting for you...</h3>
                                                        <p className="text-gray-400 font-medium max-w-xs mx-auto">Please open your UPI app and authorize the payment request from <span className="text-gray-900 font-bold">MRS. DEORE PREMIX</span>.</p>
                                                    </div>
                                                    <div className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">DO NOT REFRESH OR GO BACK</div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>

                            <div className="lg:col-span-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-primary p-10 rounded-[3rem] text-white shadow-2xl sticky top-32"
                                >
                                    <h3 className="text-2xl font-serif font-black mb-8 pb-4 border-b border-white/10">Order Profile</h3>
                                    <div className="space-y-6 mb-10 max-h-[40vh] overflow-y-auto custom-scrollbar">
                                        {items.map((item) => {
                                            const effectivePrice = item.product.bulkPrice && item.quantity >= item.product.bulkMinQuantity
                                                ? item.product.bulkPrice
                                                : item.product.sellingPrice;
                                            return (
                                                <div key={item.product?.id} className="flex justify-between items-center group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 bg-white/10 rounded-xl overflow-hidden flex-shrink-0">
                                                            <img
                                                                src={item.product.images?.[0]?.imageUrl || 'https://placehold.co/100'}
                                                                alt={item.product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity leading-tight">{item.product?.name}</span>
                                                            <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">{item.quantity} units</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-black">₹{(effectivePrice * item.quantity).toLocaleString()}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="border-t border-white/20 pt-8 space-y-4">
                                        {/* Coupon Selection */}
                                        <div className="mb-6">
                                            {!appliedCoupon ? (
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={couponCode}
                                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                        placeholder="PROMO CODE"
                                                        className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-4 pr-12 text-sm font-black placeholder:text-white/40 focus:ring-2 focus:ring-white/40 focus:bg-white/20 outline-none transition-all"
                                                        onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                                    />
                                                    <button
                                                        onClick={handleApplyCoupon}
                                                        disabled={couponLoading || !couponCode.trim()}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-xl bg-white text-primary hover:bg-accent hover:text-white transition-all disabled:opacity-50"
                                                    >
                                                        {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                                    </button>
                                                    {couponError && (
                                                        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-black text-red-200 mt-2 px-2 uppercase tracking-widest">
                                                            {couponError}
                                                        </motion.p>
                                                    )}
                                                </div>
                                            ) : (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="bg-white/20 border border-white/40 rounded-2xl p-4 flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Tag className="h-4 w-4 text-white" />
                                                        <div>
                                                            <span className="block text-xs font-black tracking-widest uppercase">{appliedCoupon.code}</span>
                                                            <span className="block text-[10px] font-bold opacity-60">Savings Applied</span>
                                                        </div>
                                                    </div>
                                                    <button onClick={removeCoupon} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                                                        <X className="h-4 w-4 text-white" />
                                                    </button>
                                                </motion.div>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center opacity-60">
                                            <span className="text-xs font-black uppercase tracking-widest">Subtotal</span>
                                            <span className="text-sm font-black">₹{totalPrice.toLocaleString()}</span>
                                        </div>

                                        {appliedCoupon && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                className="flex justify-between items-center text-green-200"
                                            >
                                                <span className="text-xs font-black uppercase tracking-widest">Discount</span>
                                                <span className="text-sm font-black">- ₹{appliedCoupon.discountAmount.toLocaleString()}</span>
                                            </motion.div>
                                        )}

                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-black uppercase tracking-widest opacity-60">To be Paid</span>
                                            <span className="text-4xl font-black tracking-tighter">₹{finalAmount.toLocaleString()}</span>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-center pt-4 italic">Thank you for choosing tradition.</p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success-screen"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-20 rounded-[4rem] shadow-2xl text-center max-w-4xl mx-auto"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                className="mx-auto flex items-center justify-center h-24 w-24 rounded-[2rem] bg-green-50 text-green-500 mb-10"
                            >
                                <CheckCircle className="h-12 w-12" />
                            </motion.div>
                            <h2 className="text-5xl font-serif font-black text-gray-900 mb-4">Tradition Confirmed.</h2>
                            <p className="text-gray-400 text-lg font-medium mb-12 max-w-md mx-auto">Your order <span className="text-primary font-black">#ORD-{orderId?.toString().padStart(5, '0')}</span> has been synchronized with our kitchen.</p>

                            <div className="p-8 bg-gray-50 rounded-[3rem] text-left border border-gray-100 mb-12">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction Info</p>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-gray-900">UPI Reference: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                                            <p className="text-sm font-medium text-gray-500">{new Date().toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estimated Arrival</p>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-gray-900">Wednesday, 26th Feb</p>
                                            <p className="text-sm font-medium text-gray-500">Traditional Express Shipping</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <motion.button
                                    whileHover={{ y: -5 }}
                                    onClick={() => navigate('/')}
                                    className="px-10 py-5 border-2 border-gray-100 text-gray-400 rounded-3xl font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all"
                                >
                                    Return Home
                                </motion.button>
                                <motion.button
                                    whileHover={{ y: -5 }}
                                    onClick={() => navigate('/orders')}
                                    className="px-10 py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-accent transition-all"
                                >
                                    Track My Tradition
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CheckoutPage;
