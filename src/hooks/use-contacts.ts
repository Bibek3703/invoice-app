"use client";

import { useQuery } from "@tanstack/react-query";
import { ContactSearchColumnType, FilterOption } from "@/types";
import { getAllContacts, getClients, getContactById, getVendors } from "@/lib/actions/contacts";

// Query Keys
export const contactKeys = {
    all: ["contacts"] as const,
    list: (filters: FilterOption<ContactSearchColumnType>) => [...contactKeys.all, "list", filters] as const,
    client: (filters: FilterOption<ContactSearchColumnType>) => [...contactKeys.all, "clients", filters] as const,
    vendor: (filters: FilterOption<ContactSearchColumnType>) => [...contactKeys.all, "vendors", filters] as const,
    detail: (id: string) => [...contactKeys.all, "detail", id] as const,
};

/** Fetch all contacts */
export function useAllContacts(companyId: string, filters: FilterOption<ContactSearchColumnType> = {}) {
    return useQuery({
        queryKey: contactKeys.list(filters),
        queryFn: () => getAllContacts(companyId, filters),
        staleTime: 1000 * 60 * 5, // cache for 5 minutes
    });
}

/** Fetch contacts (vendor) */
export function useVendors(companyId: string, filters: FilterOption<ContactSearchColumnType> = {}) {
    return useQuery({
        queryKey: contactKeys.vendor(filters),
        queryFn: () => getVendors(companyId, filters),
        staleTime: 1000 * 60 * 5,
    });
}

/** Fetch contacts (client) */
export function useClients(companyId: string, filters: FilterOption<ContactSearchColumnType> = {}) {
    return useQuery({
        queryKey: contactKeys.client(filters),
        queryFn: () => getClients(companyId, filters),
        staleTime: 1000 * 60 * 5,
    });
}

/** Fetch a single invoice by ID */
export function useContact(companyId: string, contactId: string | null | undefined) {
    return useQuery({
        queryKey: contactKeys.detail(contactId || ""),
        queryFn: async () => {
            if (!contactId) throw new Error("Contact ID is required");
            return getContactById(companyId, contactId);
        },
        enabled: !!contactId, // only run if ID is provided
        staleTime: 1000 * 60 * 5,
    });
}
