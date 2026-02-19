import React from 'react';
import useCartStore from '../store/useCartStore';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CartDrawer: React.FC = () => {
    const { items, isOpen, closeCart, updateQuantity, removeItem } = useCartStore();

    const subtotal = items.reduce((sum, item) => {
        const price = (item.quantity >= 50 && item.product.bulkPrice) ? item.product.bulkPrice : item.product.sellingPrice;
        return sum + (price * item.quantity);
    }, 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={closeCart}
                    ></motion.div>

                    <div className="fixed inset-y-0 right-0 max-w-full flex">
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
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
                                            whileHover={{ rotate: 90 }}
                                            whileTap={{ scale: 0.8 }}
                                            onClick={closeCart}
                                            className="p-3 bg-neutral-light rounded-2xl text-gray-400 hover:text-primary transition-colors"
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
                                                                    initial={{ x: 50, opacity: 0 }}
                                                                    animate={{ x: 0, opacity: 1 }}
                                                                    exit={{ x: 100, opacity: 0 }}
                                                                    transition={{ delay: index * 0.05 }}
                                                                    className="flex items-center gap-6 group"
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
                                                                                    className="p-1.5 hover:bg-white rounded-lg shadow-sm transition-all"
                                                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                                                >
                                                                                    <Minus className="h-3 w-3" />
                                                                                </motion.button>
                                                                                <span className="px-4 font-black text-xs">{item.quantity}</span>
                                                                                <motion.button
                                                                                    whileTap={{ scale: 0.7 }}
                                                                                    className="p-1.5 hover:bg-white rounded-lg shadow-sm transition-all"
                                                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
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
                                            className="group relative flex justify-center items-center py-5 bg-primary text-white text-xs font-black uppercase tracking-[0.3em] rounded-3xl shadow-xl shadow-primary/20 hover:bg-accent transition-all duration-300"
                                            onClick={closeCart}
                                        >
                                            Proceed to Checkout
                                            <motion.div
                                                className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 overflow-hidden rounded-3xl"
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
    );
};

export default CartDrawer;
