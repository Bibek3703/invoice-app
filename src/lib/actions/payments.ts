'use server';

import { db } from '@/db';
import { invoices, payments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createPayment(data: {
    invoiceId: string;
    payerId: string;
    amount: string;
    currency: string;
    paymentMethod: string;
    paymentMethodId?: string;
}) {
    try {
        const [newPayment] = await db.insert(payments).values({
            ...data,
            status: 'completed',
            paymentDate: new Date(),
            transactionId: `txn_${Date.now()}`, // Generate proper transaction ID
        }).returning();

        // Update invoice status to paid
        await db
            .update(invoices)
            .set({
                status: 'paid',
                paidDate: new Date(),
            })
            .where(eq(invoices.id, data.invoiceId));

        revalidatePath('/invoices');
        return { success: true, data: newPayment };
    } catch (error) {
        return { success: false, error: 'Failed to process payment' };
    }
}

export async function getPaymentsByInvoice(invoiceId: string) {
    try {
        const result = await db.query.payments.findMany({
            where: eq(payments.invoiceId, invoiceId),
            with: {
                payer: true,
                paymentMethod: true,
            },
        });

        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: 'Failed to fetch payments' };
    }
}
