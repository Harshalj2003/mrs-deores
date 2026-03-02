export interface CustomOrderRequest {
    itemName: string;
    description: string;
    quantity: number;
    budget: number;
    referenceProduct?: { id: number };
}

export interface CustomOrderResponse {
    id: number;
    itemName: string;
    description: string;
    quantity: number;
    budget: number;
    status: CustomOrderStatus;
    adminNote: string | null;
    customerNote: string | null;
    paymentMode: string | null;
    agreedPrice: number | null;
    linkedOrder: { id: number } | null;
    referenceProduct: { id: number; name: string } | null;
    user?: {
        id: number;
        username: string;
        email: string;
        phone: string | null;
    };
    createdAt: string;
    updatedAt: string;
}

export type CustomOrderStatus =
    | 'REQUESTED'
    | 'QUOTED'
    | 'NEGOTIATING'
    | 'ACCEPTED_BY_CUSTOMER'
    | 'APPROVED'
    | 'PAYMENT_PENDING'
    | 'PAID'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'REJECTED';

export const CUSTOM_ORDER_STATUS_LABELS: Record<CustomOrderStatus, string> = {
    REQUESTED: 'Request Sent',
    QUOTED: 'Quote Received',
    NEGOTIATING: 'Negotiating',
    ACCEPTED_BY_CUSTOMER: 'Accepted (Pending Admin)',
    APPROVED: 'Approved — Pay Now',
    PAYMENT_PENDING: 'Payment Pending',
    PAID: 'Payment Received',
    PROCESSING: 'Being Prepared',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    REJECTED: 'Rejected',
};
