import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WishlistState } from './types';
import type { Product } from '../types/catalog.types';
import api from '../services/api';
import AuthService from '../services/auth.service';

const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],

            isInWishlist: (productId: number) => {
                return get().items.some((p) => p.id === productId);
            },

            addItem: async (product: Product) => {
                const { items } = get();
                if (!get().isInWishlist(product.id)) {
                    set({ items: [...items, product] });

                    const user = AuthService.getCurrentUser();
                    if (user) {
                        await api.post(`/wishlist/toggle/${product.id}`);
                    }
                }
            },

            removeItem: async (productId: number) => {
                const { items } = get();
                set({ items: items.filter((p) => p.id !== productId) });

                const user = AuthService.getCurrentUser();
                if (user) {
                    await api.post(`/wishlist/toggle/${productId}`);
                }
            },

            toggleItem: async (product: Product) => {
                const { isInWishlist, addItem, removeItem } = get();
                if (isInWishlist(product.id)) {
                    await removeItem(product.id);
                } else {
                    await addItem(product);
                }
            },

            syncWithBackend: async () => {
                const user = AuthService.getCurrentUser();
                if (!user) return;

                try {
                    const response = await api.get<{ items: { product: Product }[] }>('/wishlist');
                    if (response.data && response.data.items) {
                        const backendItems: Product[] = response.data.items.map((item) => item.product);
                        set({ items: backendItems });
                    }
                } catch (error) {
                    console.error("Failed to sync wishlist", error);
                }
            }
        }),
        {
            name: 'mrs-deores-wishlist',
        }
    )
);

export default useWishlistStore;
