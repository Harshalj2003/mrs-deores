import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Edit2, Trash2, CheckCircle2, Home as HomeIcon } from 'lucide-react';
import api from '../services/api';
import type { Address } from '../types/Address';

const AddressBook: React.FC = () => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<Address>>({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const res = await api.get('/addresses');
            setAddresses(res.data);
        } catch (err) {
            console.error("Failed to load addresses", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (address?: Address) => {
        setError('');
        if (address) {
            setEditingId(address.id || null);
            setFormData(address);
        } else {
            setEditingId(null);
            setFormData({
                fullName: '',
                phoneNumber: '',
                streetAddress: '',
                city: '',
                state: '',
                zipCode: '',
                isDefault: addresses.length === 0
            });
        }
        setIsFormOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            if (editingId) {
                await api.put(`/addresses/${editingId}`, formData);
            } else {
                await api.post('/addresses', formData);
            }
            await fetchAddresses();
            setIsFormOpen(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save address');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this address?")) return;
        try {
            await api.delete(`/addresses/${id}`);
            setAddresses(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error("Failed to delete address", err);
        }
    };

    const handleSetDefault = async (address: Address) => {
        if (address.isDefault) return;
        try {
            await api.put(`/addresses/${address.id}`, { ...address, isDefault: true });
            await fetchAddresses();
        } catch (err) {
            console.error("Failed to set default", err);
        }
    };

    if (loading) {
        return <div className="animate-pulse h-64 bg-gray-100 dark:bg-neutral-800 rounded-3xl" />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white font-serif">Saved Addresses</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your shipping destinations</p>
                </div>
                <button
                    onClick={() => handleOpenForm()}
                    className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-accent transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus className="h-4 w-4" /> Add New
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                    <motion.div
                        layout
                        key={addr.id}
                        className={`relative p-6 rounded-3xl border-2 transition-all ${addr.isDefault
                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                : 'border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-gray-200 dark:hover:border-neutral-700'
                            }`}
                    >
                        {addr.isDefault && (
                            <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Default
                            </div>
                        )}

                        <div className="flex items-start gap-4 mb-4">
                            <div className={`p-3 rounded-full ${addr.isDefault ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-neutral-800 text-gray-500'}`}>
                                <HomeIcon className="h-5 w-5" />
                            </div>
                            <div className="pr-20">
                                <p className="font-bold text-gray-900 dark:text-white text-lg">{addr.fullName}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{addr.phoneNumber}</p>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-6">
                            <p>{addr.streetAddress}</p>
                            <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                        </div>

                        <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-neutral-800/50">
                            <button
                                onClick={() => handleOpenForm(addr)}
                                className="flex-1 flex items-center justify-center gap-2 h-10 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                            >
                                <Edit2 className="h-4 w-4" /> Edit
                            </button>
                            <button
                                onClick={() => handleDelete(addr.id!)}
                                className="h-10 w-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                            {!addr.isDefault && (
                                <button
                                    onClick={() => handleSetDefault(addr)}
                                    className="px-4 h-10 text-xs font-black text-secondary hover:text-accent uppercase tracking-wider rounded-xl hover:bg-secondary/10 transition-colors"
                                >
                                    Set Default
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}

                {addresses.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-3xl">
                        <MapPin className="h-12 w-12 text-gray-300 dark:text-neutral-700 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No addresses saved</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">Add a shipping address to make checkout faster and easier.</p>
                        <button
                            onClick={() => handleOpenForm()}
                            className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-accent transition-colors shadow-lg"
                        >
                            Add Your First Address
                        </button>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                            onClick={() => setIsFormOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto hide-scrollbar"
                        >
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white font-serif mb-6">
                                {editingId ? 'Edit Address' : 'New Address'}
                            </h3>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSave} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-xl px-4 py-3 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary"
                                            value={formData.fullName || ''}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Phone Number</label>
                                        <input
                                            required
                                            type="tel"
                                            className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-xl px-4 py-3 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary"
                                            value={formData.phoneNumber || ''}
                                            onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Street Address</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-xl px-4 py-3 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary"
                                            value={formData.streetAddress || ''}
                                            onChange={e => setFormData({ ...formData, streetAddress: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">City</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-xl px-4 py-3 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary"
                                            value={formData.city || ''}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">State</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-xl px-4 py-3 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary"
                                            value={formData.state || ''}
                                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">PIN Code / ZIP</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-xl px-4 py-3 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary"
                                            value={formData.zipCode || ''}
                                            onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-neutral-800/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary bg-white dark:bg-neutral-900"
                                        checked={formData.isDefault || false}
                                        onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                                        disabled={addresses.length === 0} // First address MUST be default
                                    />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Set as my default shipping address</span>
                                </label>

                                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="flex-1 px-6 py-3.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 bg-primary text-white px-6 py-3.5 rounded-xl font-bold hover:bg-accent transition-colors shadow-lg disabled:opacity-70 flex justify-center items-center"
                                    >
                                        {submitting ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Address'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddressBook;
