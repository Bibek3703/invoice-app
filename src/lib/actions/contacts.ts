"use server"

import { db } from "@/db";
import { ContactSearchColumnType, FilterOption, PaginatedResponse } from "@/types";
import { and, count, eq, SQL, sql } from "drizzle-orm";
import { buildSearchCondition, getSortOrder } from "../utils/contacts";
import { Contact, contacts } from "@/db/schema";

/**
 * Generic function to fetch contacts with filters, search, pagination, and relations
 */
export async function fetchContacts(
    companyId: string,
    filters: FilterOption<ContactSearchColumnType> = {},
    type?: "vendor" | "client"
): Promise<PaginatedResponse<Contact>> {
    try {
        const {
            page = 1,
            pageSize = 10,
            sortBy = "createdAt",
            sortOrder = "desc",
            columns,
            search,
        } = filters;

        const offset = (page - 1) * pageSize;

        // Build conditions
        const conditions: SQL[] = [eq(contacts.companyId, companyId)];
        if (type) conditions.push(eq(contacts.contactType, type));
        if (search) {
            const searchCondition = buildSearchCondition(search, columns);
            if (searchCondition) conditions.push(searchCondition);
        }

        // Total count
        const [totalCount] = await db
            .select({ count: count() })
            .from(contacts)
            .where(and(...conditions));

        // Fetch paginated contacts
        const contactList = await db.query.contacts.findMany({
            where: and(...conditions),
            with: {
                company: true,
            },
            orderBy: [getSortOrder(sortBy, sortOrder)],
            limit: pageSize,
            offset,
        });

        return {
            success: true,
            data: contactList,
            pagination: {
                page,
                pageSize,
                totalItems: totalCount.count,
                totalPages: Math.ceil(totalCount.count / pageSize),
            },
        };
    } catch (error) {
        console.error("Error fetching contacts:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch contacts",
        };
    }
}

// Wrapper for all contacts
export async function getAllContacts(companyId: string, filters: FilterOption<ContactSearchColumnType> = {}) {
    return fetchContacts(companyId, filters);
}

// Wrapper for sent invoices
export async function getVendors(companyId: string, filters: FilterOption<ContactSearchColumnType> = {}) {
    return fetchContacts(companyId, filters, "vendor");
}

// Wrapper for received invoices
export async function getClients(companyId: string, filters: FilterOption<ContactSearchColumnType> = {}) {
    return fetchContacts(companyId, filters, "client");
}

// Fetch single contact by ID
export async function getContactById(companyId: string, contactId: string) {
    try {
        const contact = await db.query.contacts.findFirst({
            where: and(eq(contacts.id, contactId)),
            with: {
                company: true,
            },
        });

        if (!contact) throw new Error("Contact not found");

        return { success: true, data: contact };
    } catch (error) {
        console.error("Error fetching contact:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch contact",
        };
    }
}
