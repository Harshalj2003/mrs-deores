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
    agreedPrice: number | null;
    linkedOrder: { id: number } | null;
    referenceProduct: { id: number; name: string } | null;
    createdAt: string;
    updatedAt: string;
}

export type CustomOrderStatus =
    | 'REQUESTED'
    | 'QUOTED'
    | 'APPROVED'
    | 'PAID'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'REJECTED';

export const CUSTOM_ORDER_STATUS_LABELS: Record<CustomOrderStatus, string> = {
    REQUESTED: 'Request Sent',
    QUOTED: 'Quote Received',
    APPROVED: 'Approved — Pay Now',
    PAID: 'Payment Received',
    PROCESSING: 'Being Prepared',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    REJECTED: 'Rejected',
};
