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
    averageRating: number;
    totalReviews: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Review {
    id: number;
    user: {
        id: number;
        username: string;
    };
    rating: number;
    comment: string;
    isVerifiedPurchase: boolean;
    createdAt: string;
}

export interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
}
