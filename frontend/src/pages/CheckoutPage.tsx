import React, { useState } from 'react';
import Navbar from '../components/Navbar.tsx';
import CartDrawer from '../components/CartDrawer';
import AddressList from '../components/AddressList';
import useCartStore from '../store/useCartStore';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AuthService from '../services/auth.service';
import { CreditCard, CheckCircle } from 'lucide-react';
import type { CartItem } from '../store/types';

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
        // Ideally redirect to login, but for now show message
        return (
            <div className="min-h-screen bg-neutral-light">
                <Navbar currentUser={undefined} logOut={logOut} />
                <div className="container mx-auto px-4 py-8 text-center">
                    <h2 className="text-2xl font-serif text-brand-maroon">Please Login to Checkout</h2>
                    <button onClick={() => navigate('/login')} className="mt-4 px-6 py-2 bg-brand-maroon text-white rounded-md">Login</button>
                </div>
            </div>
        );
    }

    if (items.length === 0 && step !== 3) {
        return (
            <div className="min-h-screen bg-neutral-light">
                <Navbar currentUser={user} logOut={logOut} />
                <div className="container mx-auto px-4 py-8 text-center">
                    <h2 className="text-2xl font-serif text-brand-maroon">Your Cart is Empty</h2>
                    <button onClick={() => navigate('/products')} className="mt-4 px-6 py-2 bg-brand-maroon text-white rounded-md">Continue Shopping</button>
                </div>
            </div>
        );
    }

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) return;
        setIsProcessing(true);
        try {
            const response = await api.post('/orders/checkout',
                { addressId: selectedAddressId }
            );

            setOrderId(response.data.id);
            clearCart();
            // Simulate payment delay
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
        <div className="min-h-screen bg-neutral-light">
            <Navbar currentUser={user} logOut={logOut} />

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <h1 className="text-3xl font-serif text-brand-maroon mb-8 text-center">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Flow */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Step 1: Address */}
                        <div className={`bg-white p-6 rounded-lg shadow-sm ${step === 1 ? 'ring-2 ring-brand-gold' : 'opacity-70'}`}>
                            <div className="flex items-center mb-4">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 1 ? 'bg-brand-maroon text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                                <h2 className="ml-3 text-xl font-medium text-gray-900">Shipping Address</h2>
                            </div>

                            {step === 1 && (
                                <AddressList
                                    selectedAddressId={selectedAddressId || undefined}
                                    onSelectAddress={setSelectedAddressId}
                                />
                            )}

                            {step === 1 && selectedAddressId && (
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="px-6 py-2 bg-brand-maroon text-white rounded-md hover:bg-brand-gold transition-colors">
                                        Continue to Payment
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Step 2: Payment */}
                        <div className={`bg-white p-6 rounded-lg shadow-sm ${step === 2 ? 'ring-2 ring-brand-gold' : 'opacity-70'}`}>
                            <div className="flex items-center mb-4">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 2 ? 'bg-brand-maroon text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                                <h2 className="ml-3 text-xl font-medium text-gray-900">Payment</h2>
                            </div>

                            {step === 2 && (
                                <div className="space-y-4">
                                    <div className="border p-4 rounded-md border-brand-maroon bg-brand-gold/5 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <CreditCard className="w-6 h-6 text-brand-maroon mr-3" />
                                            <span className="font-medium">Mock Payment Gateway</span>
                                        </div>
                                        <span className="text-sm text-gray-500">Test Mode</span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        This is a demonstration. No real money will be deducted. Clicking "Pay" will simulate a successful transaction.
                                    </p>

                                    <div className="mt-6 flex justify-between">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="text-gray-600 hover:text-gray-900 font-medium">
                                            Back
                                        </button>
                                        <button
                                            onClick={handlePlaceOrder}
                                            disabled={isProcessing}
                                            className="px-8 py-3 bg-brand-maroon text-white rounded-md hover:bg-brand-gold transition-colors flex items-center disabled:opacity-50">
                                            {isProcessing ? 'Processing...' : `Pay ₹${totalPrice}`}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Step 3: Success */}
                        {step === 3 && (
                            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                                    <CheckCircle className="h-10 w-10 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-serif text-brand-maroon mb-2">Order Confirmed!</h2>
                                <p className="text-gray-600 mb-6">Thank you for your purchase. Your order #{orderId} has been placed successfully.</p>
                                <div className="space-x-4">
                                    <button onClick={() => navigate('/products')} className="px-6 py-2 border border-brand-maroon text-brand-maroon rounded-md hover:bg-brand-maroon hover:text-white transition-colors">
                                        Continue Shopping
                                    </button>
                                    <button onClick={() => navigate('/orders')} className="px-6 py-2 bg-brand-maroon text-white rounded-md hover:bg-brand-gold transition-colors">
                                        My Orders
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Column: Order Summary */}
                    {step !== 3 && (
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Order Summary</h3>
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                    {items.map((item: CartItem) => {
                                        const effectivePrice = item.product.bulkPrice && item.quantity >= item.product.bulkMinQuantity
                                            ? item.product.bulkPrice
                                            : item.product.sellingPrice;
                                        return (
                                            <div key={item.product?.id} className="flex justify-between text-sm">
                                                <div className="flex items-start">
                                                    <span className="font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded mr-2">{item.quantity}x</span>
                                                    <span className="text-gray-600 truncate max-w-[150px]">{item.product?.name}</span>
                                                </div>
                                                <span className="text-gray-900">₹{effectivePrice * item.quantity}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="border-t mt-4 pt-4 space-y-2">
                                    <div className="flex justify-between font-medium text-base text-gray-900">
                                        <span>Total</span>
                                        <span>₹{totalPrice}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">* Shipping calculated at next step (Free for now)</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <CartDrawer />
            {/* Kept for accessing cart validation if needed, though hidden on checkout usually */}
        </div>
    );
};

export default CheckoutPage;
