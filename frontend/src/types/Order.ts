import type { Address } from './Address';
import type { Product } from './catalog.types';

export interface OrderItem {
    id: number;
    product: Product;
    quantity: number;
    priceAtPurchase: number;
}

export interface PaymentDetails {
    id: number;
    paymentMethod: string;
    transactionId: string;
    status: string;
    paymentDate: string;
}

export interface Order {
    id: number;
    shippingAddress: Address;
    paymentDetails: PaymentDetails;
    orderItems: OrderItem[];
    totalAmount: number;
    totalItems: number;
    status: string;
    createdAt: string;
}
