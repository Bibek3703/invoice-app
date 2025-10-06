import { paymentStatusEnum } from "@/db/schema";

type PaymentStatus = typeof paymentStatusEnum;

export interface Payment {
    id: string;
    invoiceId: string;
    invoice?: {
        id: string;
        invoiceNumber: string;
    };
    payerId: string;
    payer?: {
        id: string;
        name: string;
        email: string;
    };
    amount: string;
    currency: string;
    paymentMethod: string;
    paymentMethodId?: string;
    paymentMethodDetails?: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    paymentDate: Date;
    createdAt: Date;
}

export interface PaymentMethod {
    id: string;
    type: string;
    provider: string;
    last4: string;
    expiryDate: string;
}