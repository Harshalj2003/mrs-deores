import api from './api';
import type { CustomOrderRequest, CustomOrderResponse } from '../types/customOrder.types';

// ─── User Endpoints ──────────────────────────────────────────

export const createCustomOrder = async (data: CustomOrderRequest): Promise<CustomOrderResponse> => {
    const response = await api.post('custom-orders', data);
    return response.data;
};

export const getMyCustomOrders = async (): Promise<CustomOrderResponse[]> => {
    const response = await api.get('custom-orders/my');
    return response.data;
};

export const getCustomOrderById = async (id: number): Promise<CustomOrderResponse> => {
    const response = await api.get(`custom-orders/${id}`);
    return response.data;
};

// ─── Admin Endpoints ─────────────────────────────────────────

export const getAllCustomOrders = async (status?: string): Promise<CustomOrderResponse[]> => {
    const params = status ? { status } : {};
    const response = await api.get('custom-orders/admin/all', { params });
    return response.data;
};

export const approveCustomOrder = async (id: number, agreedPrice: number, adminNote?: string): Promise<CustomOrderResponse> => {
    const response = await api.put(`custom-orders/admin/${id}/approve`, { agreedPrice, adminNote: adminNote || '' });
    return response.data;
};

export const quoteCustomOrder = async (id: number, agreedPrice: number, adminNote?: string): Promise<CustomOrderResponse> => {
    const response = await api.put(`custom-orders/admin/${id}/quote`, { agreedPrice, adminNote: adminNote || '' });
    return response.data;
};

export const rejectCustomOrder = async (id: number, adminNote?: string): Promise<CustomOrderResponse> => {
    const response = await api.put(`custom-orders/admin/${id}/reject`, { adminNote: adminNote || '' });
    return response.data;
};

export const updateCustomOrderStatus = async (id: number, status: string): Promise<CustomOrderResponse> => {
    const response = await api.put(`custom-orders/admin/${id}/status`, { status });
    return response.data;
};
