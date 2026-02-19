import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.tsx';
import type { Order } from '../types/Order';
import { getUserOrders } from '../services/OrderService';
import { Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import type { User } from '../types/auth.types';

const MyOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
    const navigate = useNavigate();

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
        } else {
            navigate('/login');
        }

        const fetchOrders = async () => {
            try {
                const data = await getUserOrders();
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]);

    const logOut = () => {
        AuthService.logout();
        setCurrentUser(undefined);
        navigate('/login');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-neutral-light">
            <Navbar currentUser={currentUser} logOut={logOut} />

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <h1 className="text-3xl font-serif text-brand-maroon mb-8">My Orders</h1>

                {loading ? (
                    <div className="text-center py-12">Loading your orders...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium text-gray-900">No orders yet</h3>
                        <p className="text-gray-500 mt-2">Start shopping to see your orders here.</p>
                        <button onClick={() => navigate('/products')} className="mt-6 px-6 py-2 bg-brand-maroon text-white rounded-md hover:bg-brand-gold transition-colors">
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
                                    <div className="flex space-x-6 text-sm text-gray-500">
                                        <div>
                                            <span className="block text-gray-400 text-xs uppercase font-semibold">Order Placed</span>
                                            <span className="text-gray-900 font-medium">{formatDate(order.createdAt)}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-400 text-xs uppercase font-semibold">Total</span>
                                            <span className="text-gray-900 font-medium">₹{order.totalAmount}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-400 text-xs uppercase font-semibold">Ship To</span>
                                            <span className="text-gray-900 font-medium hover:text-brand-maroon cursor-pointer group relative">
                                                {order.shippingAddress.fullName}
                                                <div className="absolute hidden group-hover:block z-10 w-64 p-3 bg-white shadow-lg rounded-md border text-xs left-0 top-6">
                                                    <p className="font-bold">{order.shippingAddress.fullName}</p>
                                                    <p>{order.shippingAddress.streetAddress}</p>
                                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                                                </div>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-medium text-gray-500">Order #{order.id}</span>
                                        {/* <a href="#" className="text-brand-maroon hover:text-brand-gold text-sm font-medium mt-1">View Invoice</a> */}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-4">
                                        {order.orderItems.map((item) => (
                                            <div key={item.id} className="flex items-center">
                                                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                    {/* Placeholder image if not available or iterate images */}
                                                    <img src={item.product.images?.[0]?.imageUrl || "https://placehold.co/100"} alt={item.product.name} className="h-full w-full object-cover object-center" />
                                                </div>
                                                <div className="ml-6 flex-1 flex flex-col">
                                                    <div className="flex justify-between">
                                                        <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                                                        <p className="font-medium text-gray-900">₹{item.priceAtPurchase}</p>
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-500">{item.product.description?.substring(0, 50)}...</p>
                                                    <div className="mt-2 flex items-center">
                                                        <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 border-t pt-4 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className={`h-2.5 w-2.5 rounded-full mr-2 ${order.status === 'DELIVERED' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                            <span className="font-medium text-gray-900">{order.status === 'MOCK_PAID' || order.status === 'PAID' ? 'Processing' : order.status}</span>
                                            <span className="ml-2 text-sm text-gray-500 text-xs"> (Mock Status)</span>
                                        </div>
                                        {/* <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                                            Buy Again
                                        </button> */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrdersPage;
