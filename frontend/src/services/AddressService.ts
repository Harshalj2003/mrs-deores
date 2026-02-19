import api from './api';
import type { Address } from '../types/Address';

export const getUserAddresses = async () => {
    const response = await api.get('/addresses');
    return response.data;
};

export const addAddress = async (address: Address) => {
    const response = await api.post('/addresses', address);
    return response.data;
};

export const deleteAddress = async (id: number) => {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
};
