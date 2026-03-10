import React from 'react';
import useCartStore from '../store/useCartStore';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import StockLimitModal from './StockLimitModal';

const CartDrawer: React.FC = () => {
    const { items, isOpen, closeCart, updateQuantity, removeItem } = useCartStore();
    const navigate = useNavigate();
    const [limitModalOpen, setLimitModalOpen] = React.useState(false);
    const [limitProductName, setLimitProductName] = React.useState('');

    const handleUpdateQuantity = async (productId: number, quantity: number, productName: string) => {
        try {
            await updateQuantity(productId, quantity);
        } catch (error: any) {
            if (error.message === 'STOCK_LIMIT_REACHED') {
                setLimitProductName(productName);
                setLimitModalOpen(true);
            }
        }
    };

    const handleConfirmCustomOrder = () => {
        setLimitModalOpen(false);
        closeCart();
        navigate('/custom-order');
    };

    const subtotal = items.reduce((sum, item) => {
        const price = (item.quantity >= 50 && item.product.bulkPrice) ? item.product.bulkPrice : item.product.sellingPrice;
        return sum + (price * item.quantity);
    }, 0);

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[200] overflow-hidden">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
                            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-black/40"
                            onClick={closeCart}
                        ></motion.div>

                        <div className="fixed inset-y-0 right-0 max-w-full flex">
                            <motion.div
                                initial={{ x: '100%', scale: 0.95 }}
                                animate={{ x: 0, scale: 1 }}
                                exit={{ x: '100%', scale: 0.95 }}
                                transition={{ type: "spring", damping: 28, stiffness: 250, mass: 0.8 }}
                                className="w-screen max-w-md"
                            >
                                <div className="h-full flex flex-col bg-white shadow-2xl overflow-hidden rounded-l-[3rem]">
                                    <div className="flex-1 py-8 overflow-y-auto px-8">
                                        <div className="flex items-start justify-between mb-8">
                                            <div>
                                                <h2 className="text-3xl font-black text-gray-900 font-serif">Your Cart</h2>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{items.length} Unique Items</p>
                                            </div>
                                            <motion.button
                                                whileHover={{ rotate: 90, scale: 1.1 }}
                                                whileTap={{ scale: 0.8 }}
                                                onClick={closeCart}
                                                className="p-3 bg-neutral-light rounded-2xl text-gray-400 hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                            >
                                                <X className="h-6 w-6" />
                                            </motion.button>
                                        </div>

                                        <div className="mt-8">
                                            <div className="flow-root">
                                                <ul role="list" className="space-y-8">
                                                    <AnimatePresence mode="popLayout">
                                                        {items.length === 0 ? (
                                                            <motion.li
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                className="py-20 text-center flex flex-col items-center justify-center"
                                                            >
                                                                <div className="h-20 w-20 bg-neutral-light rounded-full flex items-center justify-center text-gray-300 mb-4">
                                                                    <ShoppingBag className="h-10 w-10" />
                                                                </div>
                                                                <p className="font-serif italic text-gray-400 text-lg">Your basket is waiting for tradition...</p>
                                                                <button onClick={closeCart} className="mt-4 text-primary font-black uppercase text-[10px] tracking-widest hover:underline">Start Shopping</button>
                                                            </motion.li>
                                                        ) : (
                                                            items.map((item, index) => {
                                                                const isBulk = item.quantity >= 50 && item.product.bulkPrice;
                                                                const price = isBulk ? item.product.bulkPrice : item.product.sellingPrice;

                                                                return (
                                                                    <motion.li
                                                                        layout
                                                                        key={item.product.id}
                                                                        initial={{ x: 50, opacity: 0, scale: 0.95 }}
                                                                        animate={{ x: 0, opacity: 1, scale: 1 }}
                                                                        exit={{ x: 60, opacity: 0, scale: 0.9 }}
                                                                        transition={{ delay: index * 0.06, type: 'spring', stiffness: 200, damping: 20 }}
                                                                        className="flex items-center gap-4 sm:gap-6 group"
                                                                    >
                                                                        <div className="h-24 w-20 bg-neutral-light rounded-2xl overflow-hidden flex-shrink-0 group-hover:shadow-lg transition-shadow duration-500">
                                                                            <img
                                                                                src={item.product.images && item.product.images.length > 0
                                                                                    ? item.product.images[0].imageUrl
                                                                                    : 'https://placehold.co/150'}
                                                                                alt={item.product.name}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        </div>

                                                                        <div className="flex-1">
                                                                            <div className="flex justify-between items-start">
                                                                                <div>
                                                                                    <h3 className="font-serif font-black text-lg text-gray-900 group-hover:text-primary transition-colors">
                                                                                        <Link to={`/product/${item.product.id}`} onClick={closeCart}>{item.product.name}</Link>
                                                                                    </h3>
                                                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.product.category?.name}</p>
                                                                                </div>
                                                                                <p className="font-black text-primary">₹{price?.toLocaleString()}</p>
                                                                            </div>

                                                                            <div className="flex items-center justify-between mt-4">
                                                                                <div className="flex items-center bg-neutral-light p-1 rounded-xl">
                                                                                    <motion.button
                                                                                        whileTap={{ scale: 0.7 }}
                                                                                        className="p-2 sm:p-1.5 hover:bg-white rounded-lg shadow-sm transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
                                                                                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                                                    >
                                                                                        <Minus className="h-3 w-3" />
                                                                                    </motion.button>
                                                                                    <span className="px-3 sm:px-4 font-black text-xs">{item.quantity}</span>
                                                                                    <motion.button
                                                                                        whileTap={{ scale: item.quantity >= item.product.stockQuantity ? 1 : 0.7 }}
                                                                                        className={`p-2 sm:p-1.5 rounded-lg shadow-sm transition-all min-h-[40px] min-w-[40px] flex items-center justify-center ${item.quantity >= item.product.stockQuantity ? 'bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed' : 'hover:bg-white text-gray-900'}`}
                                                                                        onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1, item.product.name)}
                                                                                    >
                                                                                        <Plus className="h-3 w-3" />
                                                                                    </motion.button>
                                                                                </div>

                                                                                <motion.button
                                                                                    whileHover={{ scale: 1.1, color: '#ef4444' }}
                                                                                    className="text-gray-300 transition-colors"
                                                                                    onClick={() => removeItem(item.product.id)}
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </motion.button>
                                                                            </div>
                                                                        </div>
                                                                    </motion.li>
                                                                )
                                                            })
                                                        )}
                                                    </AnimatePresence>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {items.length > 0 && (
                                        <motion.div
                                            initial={{ y: 100 }}
                                            animate={{ y: 0 }}
                                            className="bg-neutral-light/50 p-8 pt-10 rounded-t-[3.5rem] shadow-2xl border-t border-white"
                                        >
                                            <div className="flex justify-between items-end mb-6">
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                                                    <p className="text-4xl font-black text-primary">₹{subtotal.toLocaleString()}</p>
                                                </div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pb-1">Tax Incl.</p>
                                            </div>
                                            <Link
                                                to="/checkout"
                                                className="group relative flex justify-center items-center py-5 bg-primary text-white text-xs font-black uppercase tracking-[0.3em] rounded-3xl shadow-xl shadow-primary/20 hover:bg-accent transition-all duration-300 overflow-hidden min-h-[56px]"
                                                onClick={closeCart}
                                            >
                                                <span className="relative z-10">Proceed to Checkout</span>
                                                <motion.div
                                                    animate={{ x: ['-100%', '200%'] }}
                                                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
                                                    className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-[-20deg]"
                                                />
                                            </Link>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Render Modal outside so it's not strictly tied to the presence of the drawer, though it's bound by the drawer's z-index if inside. */}
            <StockLimitModal
                isOpen={limitModalOpen}
                productName={limitProductName}
                onClose={() => setLimitModalOpen(false)}
                onConfirm={handleConfirmCustomOrder}
            />
        </>
    );
};

export default CartDrawer;
