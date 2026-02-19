export interface Category {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
}

export interface ProductImage {
    id: number;
    imageUrl: string;
    isPrimary: boolean;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    mrp: number;
    sellingPrice: number;
    bulkPrice?: number;
    bulkMinQuantity: number;
    stockQuantity: number;
    images: ProductImage[];
    category: Category;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}
