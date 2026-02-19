import type { Product } from "../types/catalog.types";

export interface CartItem {
    id?: number; // Backend ID (optional for local items before sync)
    product: Product;
    quantity: number;
}

export interface CartState {
    items: CartItem[];
    isOpen: boolean;
    total: number;
    openCart: () => void;
    closeCart: () => void;
    addItem: (product: Product, quantity?: number) => Promise<void>;
    removeItem: (productId: number) => Promise<void>;
    updateQuantity: (productId: number, quantity: number) => Promise<void>;
    syncWithBackend: () => Promise<void>;
    clearCart: () => void;
}

export interface WishlistState {
    items: Product[];
    addItem: (product: Product) => Promise<void>;
    removeItem: (productId: number) => Promise<void>;
    toggleItem: (product: Product) => Promise<void>;
    isInWishlist: (productId: number) => boolean;
    syncWithBackend: () => Promise<void>;
}
