import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartState, CartItem } from './types';
import type { Product } from '../types/catalog.types';
import api from '../services/api';
import AuthService from '../services/auth.service';

const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            total: 0,

            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),

            addItem: async (product: Product, quantity = 1) => {
                const { items } = get();
                const existingItem = items.find((i) => i.product.id === product.id);
                const user = AuthService.getCurrentUser();

                let newItems: CartItem[];

                if (existingItem) {
                    newItems = items.map((i) =>
                        i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
                    );
                } else {
                    newItems = [...items, { product, quantity }];
                }

                // Optimistic Update
                set({ items: newItems, isOpen: true });

                // Backend Sync
                if (user) {
                    try {
                        await api.post('/cart/items', { productId: product.id, quantity });
                    } catch (error) {
                        console.error("Failed to sync cart item", error);
                        // Revert or show error could be added here
                    }
                }
            },

            removeItem: async (productId: number) => {
                const { items } = get();
                const newItems = items.filter((i) => i.product.id !== productId);
                set({ items: newItems });

                const user = AuthService.getCurrentUser();
                if (user) {
                    try {
                        await api.delete(`/cart/items/${productId}`);
                    } catch (error) {
                        console.error("Failed to remove cart item", error);
                    }
                }
            },

            updateQuantity: async (productId: number, quantity: number) => {
                const { items } = get();
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }

                const newItems = items.map((i) =>
                    i.product.id === productId ? { ...i, quantity } : i
                );
                set({ items: newItems });

                const user = AuthService.getCurrentUser();
                if (user) {
                    try {
                        await api.put(`/cart/items/${productId}`, { quantity });
                    } catch (error) {
                        console.error("Failed to update quantity", error);
                    }
                }
            },

            syncWithBackend: async () => {
                const user = AuthService.getCurrentUser();
                if (!user) return;

                try {
                    // First, merge local items if any
                    const { items: localItems } = get();
                    if (localItems.length > 0) {
                        // This is a naive sync, ideally backend handles merge logic
                        // For now, let's assume valid session merge
                    }

                    const response = await api.get('/cart');
                    if (response.data && response.data.items) {
                        // Transform backend CartItems to frontend CartItems
                        const backendItems: CartItem[] = response.data.items.map((item: any) => ({
                            id: item.id,
                            product: item.product,
                            quantity: item.quantity
                        }));
                        set({ items: backendItems });
                    }
                } catch (error) {
                    console.error("Failed to fetch cart from backend", error);
                }
            },

            clearCart: () => set({ items: [] }),
        }),
        {
            name: 'mrs-deores-cart', // local storage key
            partialize: (state) => ({ items: state.items }), // only persist items
        }
    )
);

export default useCartStore;
