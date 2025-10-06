"use server"

import { db } from "@/db";
import { invoiceItems, invoices } from "@/db/schema";
import { Invoice } from "@/types/invoices";
import { desc, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getInvoices(userId: string) {
    try {
        const result = await db.query.invoices.findMany({
            where: or(
                eq(invoices.senderId, userId),
                eq(invoices.recipientId, userId)
            ),
            with: {
                sender: true,
                recipient: true,
                items: true,
                payments: true,
            },
            orderBy: [desc(invoices.createdAt)],
        });

        return { success: true, data: result };
    } catch (error) {
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