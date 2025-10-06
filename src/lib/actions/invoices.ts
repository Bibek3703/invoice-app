"use server"

import { db } from "@/db";
import { invoiceItems, invoices, payments, users } from "@/db/schema";
import { FilterOption } from "@/types";
import { Invoice } from "@/types/invoices";
import { and, asc, desc, eq, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getInvoices(
    userId: string,
    filter: FilterOption & {
        status?: string;
        type?: 'all' | 'sent' | 'received';
    } = {}
) {

    try {
        const {
            page = 1,
            pageSize = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            status,
            search,
            type = 'received',
        } = filter;

        console.log('Fetching invoices with filter:', filter);


        // Build base query with joins for search
        let query = db
            .select({
                invoice: invoices,
                sender: {
                    id: sql`sender.id`,
                    name: sql`sender.name`,
                    email: sql`sender.email`,
                    companyName: sql`sender.company_name`,
                },
                recipient: {
                    id: sql`recipient.id`,
                    name: sql`recipient.name`,
                    email: sql`recipient.email`,
                    companyName: sql`recipient.company_name`,
                },
            })
            .from(invoices)
            .leftJoin(
                sql`${users} as sender`,
                sql`${invoices.senderId} = sender.id`
            )
            .leftJoin(
                sql`${users} as recipient`,
                sql`${invoices.recipientId} = recipient.id`
            )
            .$dynamic();

        // Build where conditions
        const conditions = [];

        if (type === 'sent') {
            // Only invoices sent by the user
            conditions.push(eq(invoices.senderId, userId));
        } else if (type === 'received') {
            // Only invoices received by the user
            conditions.push(eq(invoices.recipientId, userId));
        } else {
            // All invoices (sent or received)
            conditions.push(
                or(
                    eq(invoices.senderId, userId),
                    eq(invoices.recipientId, userId)
                )
            );
        }
        // Filter by status
        if (status && status !== 'all') {
            conditions.push(eq(invoices.status, status as any));
        }

        // Search by invoice number, sender name, recipient name, or company name
        if (search && search.trim()) {
            const searchTerm = `%${search.trim().toLowerCase()}%`;
            conditions.push(
                or(
                    sql`LOWER(${invoices.invoiceNumber}) LIKE ${searchTerm}`,
                    sql`LOWER(${users.name}) LIKE ${searchTerm}`,
                    sql`LOWER(${users.companyName}) LIKE ${searchTerm}`,
                    sql`LOWER(recipient.name) LIKE ${searchTerm}`,
                    sql`LOWER(recipient.company_name) LIKE ${searchTerm}`
                )
            );
        }

        // Apply where conditions
        query = query.where(and(...conditions));

        // Get total count
        const countQuery = db
            .select({ count: sql<number>`count(*)::int` })
            .from(invoices)
            .leftJoin(users, eq(invoices.senderId, users.id))
            .leftJoin(
                sql`${users} as recipient`,
                sql`${invoices.recipientId} = recipient.id`
            )
            .where(and(...conditions));

        const totalResult = await countQuery;
        const total = totalResult[0]?.count || 0;

        // Determine sort column
        const sortColumn = sortBy === 'createdAt' ? invoices.createdAt :
            sortBy === 'invoiceNumber' ? invoices.invoiceNumber :
                sortBy === 'totalAmount' ? invoices.totalAmount :
                    sortBy === 'status' ? invoices.status :
                        sortBy === 'dueDate' ? invoices.dueDate :
                            invoices.createdAt;

        // Apply sorting and pagination
        const results = await query
            .orderBy(sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn))
            .limit(pageSize)
            .offset((page - 1) * pageSize);

        // Fetch invoice items and payments for each invoice
        const invoiceIds = results.map(r => r.invoice.id);

        const items = await db.query.invoiceItems.findMany({
            where: sql`${invoiceItems.invoiceId} IN ${invoiceIds}`,
        });

        const pms = await db.query.payments.findMany({
            where: sql`${payments.invoiceId} IN ${invoiceIds}`,
            with: {
                payer: true,
            },
        });


        // Combine data
        const data = results.map(result => ({
            ...result.invoice,
            sender: {
                id: result.sender.id,
                name: result.sender.name,
                email: result.sender.email,
                companyName: result.sender.companyName,
            },
            recipient: {
                id: result.recipient.id,
                name: result.recipient.name,
                email: result.recipient.email,
                companyName: result.recipient.companyName,
            },
            items: items.filter(item => item.invoiceId === result.invoice.id),
            payments: pms.filter(payment => payment.invoiceId === result.invoice.id),
        }));


        return {
            success: true,
            data,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };

    } catch (error) {
        console.error('Error fetching invoices:', error);
        return { success: false, error: 'Failed to fetch invoices' };
    }
}

export async function getInvoiceById(invoiceId: string) {
    try {
        const result = await db.query.invoices.findFirst({
            where: eq(invoices.id, invoiceId),
            with: {
                sender: true,
                recipient: true,
                items: true,
                payments: true,
            },
        });

        if (!result) {
            return { success: false, error: 'Invoice not found' };
        }

        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: 'Failed to fetch invoice' };
    }
}

export async function createInvoice(data: Invoice) {
    try {
        let subtotal = 0;
        let taxTotal = 0;

        const itemsWithTotals = data.items.map(item => {
            const qty = parseFloat(item.quantity);
            const price = parseFloat(item.unitPrice);
            const tax = parseFloat(item.taxRate);

            const itemSubtotal = qty * price;
            const itemTax = itemSubtotal * tax;
            const itemTotal = itemSubtotal + itemTax;

            subtotal += itemSubtotal;
            taxTotal += itemTax;

            return {
                ...item,
                subtotal: itemSubtotal.toFixed(2),
                taxAmount: itemTax.toFixed(2),
                total: itemTotal.toFixed(2),
            };
        });

        const totalAmount = subtotal + taxTotal;

        // Generate invoice number
        const lastInvoice = await db.query.invoices.findFirst({
            orderBy: [desc(invoices.createdAt)],
        });

        const lastNumber = lastInvoice?.invoiceNumber
            ? parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0')
            : 0;
        const invoiceNumber = `INV-2025-${String(lastNumber + 1).padStart(4, '0')}`;

        // Create invoice
        const [newInvoice] = await db.insert(invoices).values({
            invoiceNumber,
            senderId: data.senderId,
            recipientId: data.recipientId,
            issueDate: data.issueDate,
            dueDate: data.dueDate,
            currency: data.currency,
            notes: data.notes,
            terms: data.terms,
            subtotal: subtotal.toFixed(2),
            taxTotal: taxTotal.toFixed(2),
            totalAmount: totalAmount.toFixed(2),
            status: 'draft',
        }).returning();

        // Create invoice items
        await db.insert(invoiceItems).values(
            itemsWithTotals.map(item => ({
                invoiceId: newInvoice.id,
                description: item.description,
                quantity: item.quantity,
                unitType: item.unitType,
                unitPrice: item.unitPrice,
                taxRate: item.taxRate,
                subtotal: item.subtotal,
                taxAmount: item.taxAmount,
                total: item.total,
            }))
        );

        revalidatePath('/invoices');
        return { success: true, data: newInvoice };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to create invoice' };
    }
}

export async function updateInvoice(
    invoiceId: string,
    data: Partial<Invoice>
) {
    try {
        const updates: any = { status };

        if (status === 'sent') {
            updates.sentAt = new Date();
        } else if (status === 'paid') {
            updates.paidDate = new Date();
        }

        const [updated] = await db
            .update(invoices)
            .set(updates)
            .where(eq(invoices.id, invoiceId))
            .returning();

        revalidatePath('/invoices');
        return { success: true, data: updated };
    } catch (error) {
        return { success: false, error: 'Failed to update invoice status' };
    }
}

export async function deleteInvoice(invoiceId: string) {
    try {
        await db.delete(invoices).where(eq(invoices.id, invoiceId));

        revalidatePath('/invoices');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete invoice' };
    }
}