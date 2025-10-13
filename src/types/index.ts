export interface FilterOption<T> {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    columns?: T[] | string[];
    search?: string;
}

export interface Pagination {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}


export interface PaginatedResponse<T> {
    success: boolean;
    data?: T[];
    pagination?: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
    error?: string;
}

export type InvoiceDirectionType = "outgoing" | "incoming"

export type InvoiceSearchColumnType = "invoiceNumber"
    | "notes"
    | "terms"
    | "status"
    | "currency"
    | "totalAmount"
    | "companyName"
    | "senderName"
    | "recipientName"
    | "senderEmail"
    | "recipientEmail"
