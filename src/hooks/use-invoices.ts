"use client";

import { useQuery } from "@tanstack/react-query";
import {
    getAllInvoices,
    getInvoiceById,
    getSentInvoices,
    getReceivedInvoices,
} from "@/lib/actions/invoices";
import { FilterOption, InvoiceSearchColumnType } from "@/types";

// Query Keys
export const invoiceKeys = {
    all: ["invoices"] as const,
    list: (filters: FilterOption<InvoiceSearchColumnType>) => [...invoiceKeys.all, "list", filters] as const,
    sent: (filters: FilterOption<InvoiceSearchColumnType>) => [...invoiceKeys.all, "sent", filters] as const,
    received: (filters: FilterOption<InvoiceSearchColumnType>) => [...invoiceKeys.all, "received", filters] as const,
    status: (status: string, filters: FilterOption<InvoiceSearchColumnType>) => [...invoiceKeys.all, "status", status, filters] as const,
    detail: (id: string) => [...invoiceKeys.all, "detail", id] as const,
};

/** Fetch all invoices */
export function useAllInvoices(companyId: string, filters: FilterOption<InvoiceSearchColumnType> = {}) {
    return useQuery({
        queryKey: invoiceKeys.list(filters),
        queryFn: () => getAllInvoices(companyId, filters),
        staleTime: 1000 * 60 * 5, // cache for 5 minutes
    });
}

/** Fetch sent invoices (outgoing) */
export function useSentInvoices(companyId: string, filters: FilterOption<InvoiceSearchColumnType> = {}) {
    return useQuery({
        queryKey: invoiceKeys.sent(filters),
        queryFn: () => getSentInvoices(companyId, filters),
        staleTime: 1000 * 60 * 5,
    });
}

/** Fetch received invoices (incoming) */
export function useReceivedInvoices(companyId: string, filters: FilterOption<InvoiceSearchColumnType> = {}) {
    return useQuery({
        queryKey: invoiceKeys.received(filters),
        queryFn: () => getReceivedInvoices(companyId, filters),
        staleTime: 1000 * 60 * 5,
    });
}

/** Fetch a single invoice by ID */
export function useInvoice(companyId: string, invoiceId: string | null | undefined) {
    return useQuery({
        queryKey: invoiceKeys.detail(invoiceId || ""),
        queryFn: async () => {
            if (!invoiceId) throw new Error("Invoice ID is required");
            return getInvoiceById(companyId, invoiceId);
        },
        enabled: !!invoiceId, // only run if ID is provided
        staleTime: 1000 * 60 * 5,
    });
}
