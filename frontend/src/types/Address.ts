export interface Address {
    id?: number;
    fullName: string;
    phoneNumber: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault?: boolean;
}
