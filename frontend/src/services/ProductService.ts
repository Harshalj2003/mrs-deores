import api from './api';
import type { Product, Category } from '../types/catalog.types';

export const getProducts = async (categoryId?: number, sortBy: string = 'id', order: string = 'asc'): Promise<Product[]> => {
    try {
        let params = new URLSearchParams();
        if (categoryId) params.append('categoryId', categoryId.toString());
        params.append('sortBy', sortBy);
        params.append('order', order);

        const response = await api.get<Product[]>(`products?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

export const getProductById = async (id: number): Promise<Product> => {
    try {
        const response = await api.get<Product>(`products/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        throw error;
    }
};

export const getCategories = async (): Promise<Category[]> => {
    try {
        const response = await api.get<Category[]>('categories');
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};
