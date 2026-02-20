import React, { useState } from 'react';
import type { Product, Category } from '../types/catalog.types';
import { X, Save, Plus, Trash2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductFormProps {
    product?: Product;
    categories: Category[];
    onSave: (data: ProductFormData) => void;
    onClose: () => void;
}

export interface ProductFormData {
    name: string;
    description: string;
    mrp: number;
    sellingPrice: number;
    bulkPrice: number;
    bulkMinQuantity: number;
    stockQuantity: number;
    isActive: boolean;
    categoryId: number;
    imageUrls: string[];
}

const ProductForm: React.FC<ProductFormProps> = ({ product, categories, onSave, onClose }) => {
    const [formData, setFormData] = useState<ProductFormData>({
        name: product?.name || '',
        description: product?.description || '',
        mrp: product?.mrp || 0,
        sellingPrice: product?.sellingPrice || 0,
        bulkPrice: product?.bulkPrice || 0,
        bulkMinQuantity: product?.bulkMinQuantity || 50,
        stockQuantity: product?.stockQuantity || 0,
        isActive: product?.isActive ?? true,
        categoryId: product?.category?.id || categories[0]?.id || 0,
        imageUrls: product?.images?.map(img => img.imageUrl) || [''],
    });

    const [error, setError] = useState('');

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError('');
        // Remove empty URLs
        const cleanedData = {
            ...formData,
            imageUrls: formData.imageUrls.filter(url => url.trim() !== ''),
        };
        onSave(cleanedData);
    };

    const addImageUrl = () => {
        setFormData({ ...formData, imageUrls: [...formData.imageUrls, ''] });
    };

    const removeImageUrl = (index: number) => {
        const urls = formData.imageUrls.filter((_, i) => i !== index);
        setFormData({ ...formData, imageUrls: urls.length === 0 ? [''] : urls });
    };

    const updateImageUrl = (index: number, value: string) => {
        let finalUrl = value;
        // Auto-convert Google Drive share links to direct view links
        if (value.includes('drive.google.com')) {
            console.log('Processing Drive URL:', value);
            const fileIdMatch = value.match(/\/d\/([a-zA-Z0-9_-]+)/);
            console.log('Drive match result:', fileIdMatch);
            if (fileIdMatch && fileIdMatch[1]) {
                finalUrl = `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
                console.log('Converted to:', finalUrl);
            }
        }

        const urls = [...formData.imageUrls];
        urls[index] = finalUrl;
        setFormData({ ...formData, imageUrls: urls });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-neutral-light/30">
                    <h2 className="text-2xl font-bold text-gray-900 font-serif">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Error display */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-3 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100"
                            >
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Product Name */}
                        <div className="space-y-2 md:col-span-2">
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

                        {/* Description */}
                        <div className="space-y-2 md:col-span-2">
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
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">MRP (₹)</label>
                            <input
                                type="number"
                                required
                                value={formData.mrp}
                                onChange={e => setFormData({ ...formData, mrp: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Selling Price (₹)</label>
                            <input
                                type="number"
                                required
                                value={formData.sellingPrice}
                                onChange={e => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                            />
                        </div>

                        {/* Bulk Pricing */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Bulk Price (₹)</label>
                            <input
                                type="number"
                                value={formData.bulkPrice}
                                onChange={e => setFormData({ ...formData, bulkPrice: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Bulk Min Qty</label>
                            <input
                                type="number"
                                value={formData.bulkMinQuantity}
                                onChange={e => setFormData({ ...formData, bulkMinQuantity: parseInt(e.target.value) || 50 })}
                                className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                            />
                        </div>

                        {/* Inventory & Category */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Category</label>
                            <select
                                value={formData.categoryId}
                                onChange={e => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Stock Quantity</label>
                            <input
                                type="number"
                                value={formData.stockQuantity}
                                onChange={e => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                            />
                        </div>

                        {/* Image URLs Section */}
                        <div className="space-y-3 md:col-span-2">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    <ImageIcon className="h-4 w-4 inline mr-2 text-primary" />
                                    Product Images
                                </label>
                                <div className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={addImageUrl}
                                        className="inline-flex items-center text-xs font-black text-primary hover:text-accent uppercase tracking-widest transition-colors mr-3"
                                    >
                                        <Plus className="h-3 w-3 mr-1" /> Add URL
                                    </button>
                                    <label className="inline-flex items-center text-xs font-black text-gray-500 hover:text-gray-900 uppercase tracking-widest transition-colors cursor-pointer bg-gray-100 px-3 py-1 rounded-lg">
                                        <div className="flex items-center">
                                            <span className="mr-1">Upload</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    console.log('Selected file:', file.name, file.type, file.size);
                                                    const uploadData = new FormData();
                                                    uploadData.append('file', file);

                                                    try {
                                                        const token = localStorage.getItem('token');
                                                        console.log('Sending upload request...');
                                                        const res = await fetch('http://localhost:8080/api/upload', {
                                                            method: 'POST',
                                                            headers: { 'Authorization': `Bearer ${token}` },
                                                            body: uploadData
                                                        });

                                                        console.log('Upload response status:', res.status);

                                                        if (res.ok) {
                                                            const data = await res.json();
                                                            console.log('Upload success, data:', data);
                                                            const fullUrl = data.fileDownloadUri;

                                                            const urls = [...formData.imageUrls];
                                                            const emptyIndex = urls.findIndex(u => u.trim() === '');
                                                            if (emptyIndex >= 0) {
                                                                urls[emptyIndex] = fullUrl;
                                                            } else {
                                                                urls.push(fullUrl);
                                                            }
                                                            setFormData({ ...formData, imageUrls: urls });
                                                        } else {
                                                            // Try to get error text
                                                            const errText = await res.text();
                                                            console.error('Upload failed body:', errText);
                                                            alert(`Upload failed: ${res.status} ${res.statusText}\n${errText}`);
                                                        }
                                                    } catch (err: any) {
                                                        console.error('Upload error catch:', err);
                                                        alert(`Error uploading file: ${err.message || 'Unknown error'}. \nIs the backend running?`);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {formData.imageUrls.map((url, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        {/* Preview thumbnail */}
                                        <div className="h-12 w-12 rounded-xl bg-neutral-light border border-gray-200 overflow-hidden flex-shrink-0">
                                            {url.trim() ? (
                                                <img
                                                    src={url}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                    referrerPolicy="no-referrer"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-300">
                                                    <ImageIcon className="h-5 w-5" />
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="url"
                                            value={url}
                                            onChange={e => updateImageUrl(index, e.target.value)}
                                            className="flex-1 px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all text-sm"
                                            placeholder={index === 0 ? "Primary image URL (shown first)" : "Additional image URL"}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImageUrl(index)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">First URL will be used as the primary/thumbnail image</p>
                        </div>
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
                </form>

                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-500 font-medium hover:text-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => handleSubmit()}
                        className="inline-flex items-center px-8 py-3 bg-primary text-white rounded-xl hover:bg-accent transition-all shadow-lg shadow-primary/20 font-bold"
                    >
                        <Save className="h-5 w-5 mr-2" /> Save Product
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ProductForm;
