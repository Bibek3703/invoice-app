"use server"

import { db } from "@/db";
import { invoices, Invoice } from "@/db/schema";
import { FilterOption, InvoiceSearchColumnType, PaginatedResponse } from "@/types";
import { and, count, eq, SQL, sql } from "drizzle-orm";
import { buildSearchCondition, getSortOrder } from "../utils/invoices";

/**
 * Generic function to fetch invoices with filters, search, pagination, and relations
 */
export async function fetchInvoices(
    companyId: string,
    filters: FilterOption<InvoiceSearchColumnType> = {},
    direction?: "incoming" | "outgoing"
): Promise<PaginatedResponse<Invoice>> {
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

        console.log({ page, pageSize })

        // Build conditions
        const conditions: SQL[] = [eq(invoices.companyId, companyId)];
        if (direction) conditions.push(eq(invoices.direction, direction));
        if (search) {
            const searchCondition = buildSearchCondition(search, columns);
            if (searchCondition) conditions.push(searchCondition);
        }

        // Total count
        const [totalCount] = await db
            .select({ count: count() })
            .from(invoices)
            .where(and(...conditions));

        // Fetch paginated invoices
        const invoiceList = await db.query.invoices.findMany({
            where: and(...conditions),
            with: {
                sender: true,
                recipient: true,
                items: true,
                payments: true,
                company: true,
            },
            orderBy: [getSortOrder(sortBy, sortOrder)],
            limit: pageSize,
            offset,
        });

        return {
            success: true,
            data: invoiceList,
            pagination: {
                page,
                pageSize,
                totalItems: totalCount.count,
                totalPages: Math.ceil(totalCount.count / pageSize),
            },
        };
    } catch (error) {
        console.error("Error fetching invoices:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch invoices",
        };
    }
}

// Wrapper for all invoices
export async function getAllInvoices(companyId: string, filters: FilterOption<InvoiceSearchColumnType> = {}) {
    return fetchInvoices(companyId, filters);
}

// Wrapper for sent invoices
export async function getSentInvoices(companyId: string, filters: FilterOption<InvoiceSearchColumnType> = {}) {
    return fetchInvoices(companyId, filters, "outgoing");
}

// Wrapper for received invoices
export async function getReceivedInvoices(companyId: string, filters: FilterOption<InvoiceSearchColumnType> = {}) {
    return fetchInvoices(companyId, filters, "incoming");
}

// Fetch single invoice by ID (unchanged)
export async function getInvoiceById(companyId: string, invoiceId: string) {
    try {
        const invoice = await db.query.invoices.findFirst({
            where: and(eq(invoices.id, invoiceId), eq(invoices.companyId, companyId)),
            with: {
                sender: true,
                recipient: true,
                items: true,
                payments: true,
                company: true,
            },
        });

        if (!invoice) throw new Error("Invoice not found");

        return { success: true, data: invoice };
    } catch (error) {
        console.error("Error fetching invoice:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch invoice",
        };
    }
}
