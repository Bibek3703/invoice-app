import { contacts } from "@/db/schema";
import { asc, desc, ilike, or, sql } from "drizzle-orm";

/**
 * Helper function to build search condition across specified columns
 */
export function buildSearchCondition(search: string, columns?: string[]) {
    const searchPattern = `%${search}%`;
    const defaultColumns: string[] = [];
    const searchColumns = columns && columns.length > 0 ? columns : defaultColumns;

    const conditions = searchColumns.map((col) => {
        switch (col) {
            // Invoice fields
            case "name":
                return ilike(contacts.name, searchPattern);
            case "email":
                return ilike(contacts.email, searchPattern);
            case "phone":
                return ilike(contacts.phone, searchPattern);
            case "mobilePhone":
                return ilike(contacts.mobilePhone, searchPattern);
            case "contactType":
                return ilike(contacts.contactType, searchPattern);
            case "companyName":
                return sql`EXISTS (SELECT 1 FROM companies c WHERE c.id = contacts.company_id AND c.name ILIKE ${`%${searchPattern}%`})`
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
        name: contacts.name,
        createdAt: contacts.createdAt,
    }[sortBy] || contacts.createdAt;

    return sortOrder === "asc" ? asc(column) : desc(column);
}