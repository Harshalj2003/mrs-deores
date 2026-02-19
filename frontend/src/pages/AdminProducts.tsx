import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import ProductForm from '../components/ProductForm';
import { Plus, Search, Edit2, Trash2, Filter } from 'lucide-react';
import api from '../services/api';
import type { Product, Category } from '../types/catalog.types';

const AdminProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error("Failed to fetch admin product data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = () => {
        setSelectedProduct(undefined);
        setIsFormOpen(true);
    };

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product);
        setIsFormOpen(true);
    };

    const handleSaveProduct = async (formData: Partial<Product>) => {
        try {
            if (selectedProduct) {
                // Update
                const res = await api.put(`/products/${selectedProduct.id}`, formData);
                setProducts(products.map(p => p.id === selectedProduct.id ? res.data : p));
            } else {
                // Create
                const res = await api.post('/products', formData);
                setProducts([res.data, ...products]);
            }
            setIsFormOpen(false);
        } catch (err) {
            console.error("Failed to save product", err);
            alert("Error saving product. Please check console.");
        }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await api.delete(`/products/${id}`);
            setProducts(products.filter(p => p.id !== id));
        } catch (err) {
            console.error("Failed to delete product", err);
        }
    };

    return (
        <div className="flex min-h-screen bg-neutral-light">
            <AdminSidebar />
            <main className="flex-1 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-serif">Product Management</h1>
                        <p className="text-gray-500 mt-1">Add, edit, or remove products from the catalog.</p>
                    </div>
                    <button
                        onClick={handleAddProduct}
                        className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-xl hover:bg-accent transition-colors shadow-lg shadow-primary/20"
                    >
                        <Plus className="h-5 w-5 mr-2" /> Add Product
                    </button>
                </header>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="pl-10 pr-4 py-2 w-full bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                        </div>
                        <button className="inline-flex items-center text-sm text-gray-500 hover:text-primary p-2">
                            <Filter className="h-4 w-4 mr-2" /> Filters
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Stock</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-10 text-gray-400 animate-pulse font-medium">Loading catalog...</td></tr>
                                ) : products.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-10 text-gray-400 font-medium">No products found.</td></tr>
                                ) : products.map(product => (
                                    <tr key={product.id} className="hover:bg-neutral-light/50 transition-colors cursor-default group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-lg bg-gray-100 mr-3 overflow-hidden border border-gray-200">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0].imageUrl} className="h-full w-full object-cover" alt="" />
                                                    ) : <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-tight">None</div>}
                                                </div>
                                                <span className="font-medium text-gray-900 group-hover:text-primary transition-colors">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{product.category.name}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">₹{product.sellingPrice}</td>
                                        <td className="px-6 py-4 text-gray-500">{product.stockQuantity || 0}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {product.isActive ? 'Active' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleEditProduct(product)}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-lg transition-all"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {isFormOpen && (
                    <ProductForm
                        product={selectedProduct}
                        categories={categories}
                        onSave={handleSaveProduct}
                        onClose={() => setIsFormOpen(false)}
                    />
                )}
            </main>
        </div>
    );
};

export default AdminProducts;
