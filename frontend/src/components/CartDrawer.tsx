import React from 'react';
import useCartStore from '../store/useCartStore';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartDrawer: React.FC = () => {
    const { items, isOpen, closeCart, updateQuantity, removeItem } = useCartStore();

    const subtotal = items.reduce((sum, item) => {
        const price = (item.quantity >= 50 && item.product.bulkPrice) ? item.product.bulkPrice : item.product.sellingPrice;
        return sum + (price * item.quantity);
    }, 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeCart}></div>

            <div className="fixed inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md">
                    <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                        <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                            <div className="flex items-start justify-between">
                                <h2 className="text-lg font-medium text-gray-900 font-serif">Shopping Cart</h2>
                                <div className="ml-3 h-7 flex items-center">
                                    <button
                                        type="button"
                                        className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                                        onClick={closeCart}
                                    >
                                        <span className="sr-only">Close panel</span>
                                        <X className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8">
                                <div className="flow-root">
                                    <ul role="list" className="-my-6 divide-y divide-gray-200">
                                        {items.length === 0 ? (
                                            <li className="py-6 text-center text-gray-500">
                                                Your cart is empty.
                                            </li>
                                        ) : (
                                            items.map((item) => {
                                                const isBulk = item.quantity >= 50 && item.product.bulkPrice;
                                                const price = isBulk ? item.product.bulkPrice : item.product.sellingPrice;

                                                return (
                                                    <li key={item.product.id} className="py-6 flex">
                                                        <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                                                            <img
                                                                src={item.product.images && item.product.images.length > 0
                                                                    ? item.product.images[0].imageUrl
                                                                    : 'https://placehold.co/150'}
                                                                alt={item.product.name}
                                                                className="w-full h-full object-center object-cover"
                                                            />
                                                        </div>

                                                        <div className="ml-4 flex-1 flex flex-col">
                                                            <div>
                                                                <div className="flex justify-between text-base font-medium text-gray-900">
                                                                    <h3>
                                                                        <Link to={`/product/${item.product.id}`} onClick={closeCart}>{item.product.name}</Link>
                                                                    </h3>
                                                                    <p className="ml-4">₹{price?.toFixed(2)}</p>
                                                                </div>
                                                                <p className="mt-1 text-sm text-gray-500">{item.product.category?.name}</p>
                                                                {isBulk && (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                                                                        Bulk Price Applied
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 flex items-end justify-between text-sm">
                                                                <div className="flex items-center border border-gray-300 rounded">
                                                                    <button
                                                                        className="p-1 hover:bg-gray-100"
                                                                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                                    >
                                                                        <Minus className="h-4 w-4" />
                                                                    </button>
                                                                    <span className="px-2">{item.quantity}</span>
                                                                    <button
                                                                        className="p-1 hover:bg-gray-100"
                                                                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                                    >
                                                                        <Plus className="h-4 w-4" />
                                                                    </button>
                                                                </div>

                                                                <div className="flex">
                                                                    <button
                                                                        type="button"
                                                                        className="font-medium text-primary hover:text-accent flex items-center"
                                                                        onClick={() => removeItem(item.product.id)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                )
                                            })
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {items.length > 0 && (
                            <div className="border-t border-gray-200 py-6 px-4 sm:px-6 bg-gray-50">
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                    <p>Subtotal</p>
                                    <p>₹{subtotal.toFixed(2)}</p>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                                <div className="mt-6">
                                    <Link
                                        to="/checkout"
                                        className="flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-accent w-full"
                                        onClick={closeCart}
                                    >
                                        Checkout
                                    </Link>
                                </div>
                                <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                                    <p>
                                        or{' '}
                                        <button
                                            type="button"
                                            className="text-primary font-medium hover:text-accent"
                                            onClick={closeCart}
                                        >
                                            Continue Shopping<span aria-hidden="true"> &rarr;</span>
                                        </button>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartDrawer;
