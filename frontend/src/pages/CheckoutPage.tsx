import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import AddressList from '../components/AddressList';
import useCartStore from '../store/useCartStore';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AuthService from '../services/auth.service';
import { CreditCard, CheckCircle, ChevronRight, Lock, MapPin, CreditCard as CardIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from "clsx";

const CheckoutPage: React.FC = () => {
    const { items, clearCart } = useCartStore();
    const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Success
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderId, setOrderId] = useState<number | null>(null);
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
    const user = AuthService.getCurrentUser();

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

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) return;
        setIsProcessing(true);
        try {
            const response = await api.post('/orders/checkout', { addressId: selectedAddressId });
            setOrderId(response.data.id);
            clearCart();
            setTimeout(() => {
                setStep(3);
                setIsProcessing(false);
            }, 2000);
        } catch (error) {
            console.error("Checkout failed", error);
            setIsProcessing(false);
            alert("Checkout failed. Please try again.");
        }
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
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                            <div className="border-2 border-primary/20 bg-primary/5 p-8 rounded-[2rem] flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="bg-white p-3 rounded-xl mr-4">
                                                        <CreditCard className="w-8 h-8 text-primary" />
                                                    </div>
                                                    <div>
                                                        <span className="font-black text-gray-900 block">Mock Payment Gateway</span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Secured Sandbox</span>
                                                    </div>
                                                </div>
                                                <CheckCircle className="h-6 w-6 text-primary fill-current bg-white rounded-full" />
                                            </div>
                                            <p className="text-sm text-gray-400 font-medium">
                                                Traditional orders are honored with digital speed. No real funds will be moved during this premium demonstration.
                                            </p>

                                            <div className="mt-10 flex justify-between items-center">
                                                <button onClick={() => setStep(1)} className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-primary">Back to Delivery</button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handlePlaceOrder}
                                                    disabled={isProcessing}
                                                    className="px-12 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-accent transition-colors disabled:opacity-50"
                                                >
                                                    {isProcessing ? 'Verifying...' : `Pay ₹${totalPrice.toLocaleString()}`}
                                                </motion.button>
                                            </div>
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
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-black uppercase tracking-widest opacity-60">To be Paid</span>
                                            <span className="text-4xl font-black tracking-tighter">₹{totalPrice.toLocaleString()}</span>
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
                                    Track Order
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
