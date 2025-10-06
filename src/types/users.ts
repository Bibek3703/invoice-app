export interface User {
    id: string;
    email: string;
    name: string;
    companyName?: string;
    phone?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    taxId?: string;
    createdAt: Date;
    updatedAt: Date;
}