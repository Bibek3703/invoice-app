import { invoiceStatusEnum } from "@/db/schema";
import { User } from "./users";
import { Payment } from "./payments";
import { Notification } from "./notifications";

type InvoiceStatus = typeof invoiceStatusEnum;

export interface Invoice {
    id: string;
    invoiceNumber: string;
    status: InvoiceStatus;
    senderId: string;
    sender?: User;
    recipientId: string;
    recipient?: User;
    issueDate: Date;
    dueDate: Date;
    paidDate?: Date;
    subtotal: string;
    taxTotal: string;
    discountAmount?: string;
    totalAmount: string;
    currency: string;
    notes?: string;
    terms?: string;
    createdAt: Date;
    updatedAt: Date;
    sentAt?: Date;
    viewedAt?: Date;
    items: InvoiceItem[];
    payments?: Payment[];
    notifications?: Notification[];
}

export interface InvoiceItem {
    id: string;
    invoiceId: string;
    description: string;
    quantity: string;
    unitType: string;
    unitPrice: string;
    taxRate: string;
    createdAt: Date;
    updatedAt: Date;
}