import type { Address } from './Address';
import type { Product } from './catalog.types';
import type { User } from './auth.types';

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
    user: User;
    shippingAddress: Address;
    paymentDetails: PaymentDetails;
    orderItems: OrderItem[];
    totalAmount: number;
    totalItems: number;
    status: string;
    couponCode?: string;
    discountAmount?: number;
    trackingNumber?: string;
    carrier?: string;
    createdAt: string;
}
