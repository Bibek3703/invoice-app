import { companies, contacts, invoices } from "@/db/schema";
import { asc, desc, ilike, or, sql } from "drizzle-orm";

/**
 * Helper function to build search condition across specified columns
 * Supports searching in invoice fields and related entities (company, sender, recipient)
 */
export function buildSearchCondition(search: string, columns?: string[]) {
    const searchPattern = `%${search}%`;
    const defaultColumns: string[] = [];
    const searchColumns = columns && columns.length > 0 ? columns : defaultColumns;

    const conditions = searchColumns.map((col) => {
        switch (col) {
            // Invoice fields
            case "invoiceNumber":
                return ilike(invoices.invoiceNumber, searchPattern);
            case "notes":
                return ilike(invoices.notes, searchPattern);
            case "terms":
                return ilike(invoices.terms, searchPattern);
            case "status":
                return ilike(invoices.status, searchPattern);
            case "currency":
                return ilike(invoices.currency, searchPattern);
            case "totalAmount":
                return sql`${invoices.totalAmount}::text ILIKE ${searchPattern}`;

            // Related entity fields - these will be handled via SQL subqueries
            case "companyName":
                return sql`EXISTS (SELECT 1 FROM companies c WHERE c.id = invoices.company_id AND c.name ILIKE ${`%${searchPattern}%`})`

            case "senderName":
                sql`EXISTS (SELECT 1 FROM contacts s WHERE s.id = invoices.sender_id AND s.name ILIKE ${`%${searchPattern}%`})`;


            case "recipientName":
                sql`EXISTS (SELECT 1 FROM contacts r WHERE r.id = invoices.recipient_id AND r.name ILIKE ${`%${searchPattern}%`})`;
                ;

            case "senderEmail":
                sql`EXISTS (SELECT 1 FROM contacts r WHERE r.id = invoices.sender_id AND r.email ILIKE ${`%${searchPattern}%`})`;

            case "recipientEmail":
                sql`EXISTS (SELECT 1 FROM contacts r WHERE r.id = invoices.recipient_id AND r.email ILIKE ${`%${searchPattern}%`})`;

            default:
                return null;
        }
    }).filter((condition) => condition !== null);

    return conditions.length > 0 ? or(...conditions) : undefined;
}


/**
 * Helper function to get sort order
 */
export function getSortOrder(sortBy: string, sortOrder: "asc" | "desc") {
    const column = {
        invoiceNumber: invoices.invoiceNumber,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        totalAmount: invoices.totalAmount,
        status: invoices.status,
        createdAt: invoices.createdAt,
    }[sortBy] || invoices.createdAt;

    return sortOrder === "asc" ? asc(column) : desc(column);
}