import React, { useState } from 'react';
import type { Product, Category } from '../types/catalog.types';
import { X, Save, Image as ImageIcon } from 'lucide-react';

interface ProductFormProps {
    product?: Product; // If provided, we are editing
    categories: Category[];
    onSave: (product: Partial<Product>) => void;
    onClose: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, categories, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<Product>>(
        product || {
            name: '',
            description: '',
            mrp: 0,
            sellingPrice: 0,
            bulkPrice: 0,
            bulkMinQuantity: 50,
            stockQuantity: 0,
            isActive: true,
            category: categories[0]
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-neutral-light/30">
                    <h2 className="text-2xl font-bold text-gray-900 font-serif">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4 md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Product Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                                placeholder="e.g., Puran Poli Premix"
                            />
                        </div>

                        <div className="space-y-4 md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Description</label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                                placeholder="Detailed description of the product..."
                            />
                        </div>

                        {/* Pricing */}
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">MRP (₹)</label>
                            <input
                                type="number"
                                required
                                value={formData.mrp}
                                onChange={e => setFormData({ ...formData, mrp: parseFloat(e.target.value) })}
                                className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Selling Price (₹)</label>
                            <input
                                type="number"
                                required
                                value={formData.sellingPrice}
                                onChange={e => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) })}
                                className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                            />
                        </div>

                        {/* Bulk Pricing */}
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Bulk Price (₹)</label>
                            <input
                                type="number"
                                value={formData.bulkPrice}
                                onChange={e => setFormData({ ...formData, bulkPrice: parseFloat(e.target.value) })}
                                className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Bulk Min Qty</label>
                            <input
                                type="number"
                                value={formData.bulkMinQuantity}
                                onChange={e => setFormData({ ...formData, bulkMinQuantity: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                            />
                        </div>

                        {/* Inventory & Category */}
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Category</label>
                            <select
                                value={formData.category?.id}
                                onChange={e => setFormData({ ...formData, category: categories.find(c => c.id === parseInt(e.target.value)) })}
                                className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Stock Quantity</label>
                            <input
                                type="number"
                                value={formData.stockQuantity}
                                onChange={e => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                            />
                        </div>

                        {/* Status Toggle */}
                        <div className="flex items-center space-x-3 md:col-span-2 bg-neutral-light/30 p-4 rounded-2xl">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-5 h-5 accent-primary"
                            />
                            <label htmlFor="isActive" className="text-sm font-bold text-gray-700 uppercase tracking-wider cursor-pointer">Product is Active (Visible to customers)</label>
                        </div>
                    </div>
                </form>

                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-500 font-medium hover:text-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="inline-flex items-center px-8 py-3 bg-primary text-white rounded-xl hover:bg-accent transition-all shadow-lg shadow-primary/20 font-bold"
                    >
                        <Save className="h-5 w-5 mr-2" /> Save Product
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductForm;
