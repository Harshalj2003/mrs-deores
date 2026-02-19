import React, { useEffect } from 'react';
import useWishlistStore from '../store/useWishlistStore';
import useCartStore from '../store/useCartStore';
import { Trash2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist: React.FC = () => {
    const { items, removeItem, syncWithBackend } = useWishlistStore();
    const { addItem } = useCartStore();

    useEffect(() => {
        syncWithBackend();
    }, []);

    const moveToCart = (product: any) => {
        addItem(product);
        removeItem(product.id);
    };

    return (
        <div className="bg-background min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 font-serif sm:text-4xl">
                        Your Wishlist
                    </h2>
                    <p className="mt-4 text-lg text-gray-500">
                        Items you've saved for later.
                    </p>
                </div>

                <div className="mt-12">
                    {items.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                            <h3 className="text-xl font-medium text-gray-900">Your wishlist is empty</h3>
                            <div className="mt-6">
                                <Link
                                    to="/"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-accent"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                            {items.map((product) => (
                                <div key={product.id} className="group relative bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                    <div className="aspect-w-3 aspect-h-4 bg-gray-200 group-hover:opacity-75 sm:aspect-none sm:h-96">
                                        <img
                                            src={product.images && product.images.length > 0
                                                ? product.images[0].imageUrl
                                                : "https://placehold.co/600x400?text=No+Image"}
                                            alt={product.name}
                                            className="w-full h-full object-center object-cover sm:w-full sm:h-full"
                                        />
                                    </div>
                                    <div className="flex-1 p-4 space-y-2 flex flex-col">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            <Link to={`/product/${product.id}`}>
                                                <span aria-hidden="true" className="absolute inset-0" />
                                                {product.name}
                                            </Link>
                                        </h3>
                                        <p className="text-sm text-gray-500">{product.description.substring(0, 60)}...</p>
                                        <div className="flex-1 flex items-end justify-between">
                                            <p className="text-base font-medium text-gray-900">₹{product.sellingPrice}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between z-10 relative">
                                        <button
                                            onClick={() => moveToCart(product)}
                                            className="text-sm font-medium text-primary hover:text-accent flex items-center"
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-1" />
                                            Move to Cart
                                        </button>
                                        <button
                                            onClick={() => removeItem(product.id)}
                                            className="text-sm font-medium text-red-600 hover:text-red-500 flex items-center"
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Wishlist;
