import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { Grid, Plus, Edit2, Trash2, Save, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
    id?: number;
    name: string;
    description: string;
    imageUrl: string;
    displayOrder: number;
    gridSize: string;
    viewMode: string;
}

const EMPTY_CATEGORY: Category = {
    name: '',
    description: '',
    imageUrl: '',
    displayOrder: 0,
    gridSize: 'MEDIUM',
    viewMode: 'AUTO',
};

const AdminCategories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editCategory, setEditCategory] = useState<Category>(EMPTY_CATEGORY);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const fetchCategories = () => {
        setLoading(true);
        api.get('/categories').then(res => {
            setCategories(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => { fetchCategories(); }, []);

    const openCreate = () => {
        setEditCategory(EMPTY_CATEGORY);
        setIsEditing(false);
        setShowForm(true);
        setError('');
    };

    const openEdit = (cat: Category) => {
        setEditCategory({ ...cat });
        setIsEditing(true);
        setShowForm(true);
        setError('');
    };

    const handleSave = async () => {
        if (!editCategory.name.trim()) { setError('Category name is required.'); return; }
        setSaving(true);
        setError('');
        try {
            if (isEditing && editCategory.id) {
                await api.put(`/categories/${editCategory.id}`, editCategory);
            } else {
                await api.post('/categories', editCategory);
            }
            setShowForm(false);
            fetchCategories();
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Failed to save. Please try again.');
        }
        setSaving(false);
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/categories/${id}`);
            setDeleteConfirmId(null);
            fetchCategories();
        } catch {
            setError('Failed to delete category.');
        }
    };

    const handleImageUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setEditCategory(prev => ({ ...prev, imageUrl: res.data.fileDownloadUri }));
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Image upload failed. Make sure you are logged in as admin.');
        }
    };

    const GRID_SIZES = ['SMALL', 'MEDIUM', 'LARGE', 'FEATURED'];
    const VIEW_MODES = ['AUTO', 'MANUAL'];

    return (
        <div className="flex min-h-screen bg-neutral-light font-sans">
            <AdminSidebar />
            <main className="flex-1 p-6 lg:p-10 overflow-auto">
                <div className="max-w-5xl mx-auto">
                    <header className="mb-8 flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 font-serif mb-2">Category Management</h1>
                            <p className="text-gray-500">Organize, style, and control category display on your storefront.</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={openCreate}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-accent transition-all shadow-lg shadow-primary/20 text-sm"
                        >
                            <Plus className="h-4 w-4" /> Add Category
                        </motion.button>
                    </header>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 border border-red-100">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-neutral-light/40">
                                        <th className="text-left px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</th>
                                        <th className="text-left px-4 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest hidden md:table-cell">Grid Size</th>
                                        <th className="text-left px-4 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest hidden md:table-cell">View Mode</th>
                                        <th className="text-left px-4 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest hidden sm:table-cell">Order</th>
                                        <th className="text-right px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {categories.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-16 text-gray-400">No categories found. Click "Add Category" to start.</td></tr>
                                    ) : categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-neutral-light/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-neutral-light border border-gray-200 overflow-hidden flex-shrink-0">
                                                        {cat.imageUrl ? (
                                                            <img src={cat.imageUrl} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full flex items-center justify-center"><Grid className="h-4 w-4 text-gray-300" /></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{cat.name}</p>
                                                        <p className="text-xs text-gray-400 truncate max-w-[180px]">{cat.description || '—'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 hidden md:table-cell">
                                                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-lg">
                                                    {cat.gridSize || 'MEDIUM'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 hidden md:table-cell">
                                                <span className="text-xs text-gray-500 font-medium">{cat.viewMode || 'AUTO'}</span>
                                            </td>
                                            <td className="px-4 py-4 hidden sm:table-cell text-sm text-gray-500">{cat.displayOrder ?? 0}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => openEdit(cat)}
                                                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </motion.button>
                                                    {deleteConfirmId === cat.id ? (
                                                        <div className="flex items-center gap-1">
                                                            <button onClick={() => handleDelete(cat.id!)} className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg font-bold">Yes, delete</button>
                                                            <button onClick={() => setDeleteConfirmId(null)} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg font-bold">Cancel</button>
                                                        </div>
                                                    ) : (
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => setDeleteConfirmId(cat.id!)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Category Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 font-serif flex items-center gap-2">
                                    <Grid className="h-5 w-5 text-primary" />
                                    {isEditing ? 'Edit Category' : 'Add New Category'}
                                </h2>
                                <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                {error && (
                                    <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-sm border border-red-100">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Name *</label>
                                    <input
                                        value={editCategory.name}
                                        onChange={e => setEditCategory(p => ({ ...p, name: e.target.value }))}
                                        placeholder="e.g., Instant Premixes"
                                        className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Description</label>
                                    <textarea rows={2} value={editCategory.description} onChange={e => setEditCategory(p => ({ ...p, description: e.target.value }))} placeholder="Short description..." className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm resize-none" />
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest flex items-center gap-1"><ImageIcon className="h-3 w-3" /> Category Image</label>
                                    <div className="flex gap-3 items-start">
                                        <div className="h-16 w-16 rounded-xl bg-neutral-light border border-gray-200 overflow-hidden flex-shrink-0">
                                            {editCategory.imageUrl ? (
                                                <img src={editCategory.imageUrl} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full flex items-center justify-center"><ImageIcon className="h-5 w-5 text-gray-300" /></div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <input value={editCategory.imageUrl} onChange={e => setEditCategory(p => ({ ...p, imageUrl: e.target.value }))} placeholder="Image URL" className="w-full px-3 py-2 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-xs" />
                                            <label className="inline-flex items-center text-xs font-bold text-gray-600 hover:text-primary bg-gray-100 hover:bg-primary/10 px-3 py-2 rounded-lg cursor-pointer transition-all">
                                                Upload from device
                                                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Grid Size</label>
                                        <select value={editCategory.gridSize} onChange={e => setEditCategory(p => ({ ...p, gridSize: e.target.value }))} className="w-full px-3 py-2.5 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm">
                                            {GRID_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-gray-600 uppercase tracking-widest">View Mode</label>
                                        <select value={editCategory.viewMode} onChange={e => setEditCategory(p => ({ ...p, viewMode: e.target.value }))} className="w-full px-3 py-2.5 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm">
                                            {VIEW_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Display Order</label>
                                        <input type="number" value={editCategory.displayOrder} onChange={e => setEditCategory(p => ({ ...p, displayOrder: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2.5 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm" />
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                                <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-gray-500 font-medium hover:text-gray-700 text-sm transition-colors">
                                    Cancel
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-accent transition-all shadow-lg shadow-primary/20 font-bold text-sm disabled:opacity-70"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {saving ? 'Saving...' : 'Save Category'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminCategories;
