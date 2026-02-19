import api from './api';
import type { Order } from '../types/Order';

export const getUserOrders = async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data;
};

export const getOrder = async (id: number): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
};
