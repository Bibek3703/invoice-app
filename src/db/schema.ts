import { pgTable, uuid, varchar, text, timestamp, decimal, integer, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const invoiceStatusEnum = pgEnum('invoice_status', [
    'draft',
    'sent',
    'viewed',
    'paid',
    'overdue',
    'cancelled'
]);

export const paymentStatusEnum = pgEnum('payment_status', [
    'pending',
    'completed',
    'failed',
    'refunded'
]);

export const paymentMethodTypeEnum = pgEnum('payment_method_type', [
    'credit_card',
    'bank_account',
    'paypal',
    'stripe'
]);

export const notificationTypeEnum = pgEnum('notification_type', [
    'invoice_sent',
    'invoice_viewed',
    'payment_received',
    'invoice_overdue',
    'reminder'
]);

// Users Table
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    companyName: varchar('company_name', { length: 255 }),
    phone: varchar('phone', { length: 50 }),
    address: jsonb('address').$type<{
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    }>(),
    taxId: varchar('tax_id', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Invoices Table
export const invoices = pgTable('invoices', {
    id: uuid('id').primaryKey().defaultRandom(),
    invoiceNumber: varchar('invoice_number', { length: 100 }).notNull().unique(),
    status: invoiceStatusEnum('status').default('draft').notNull(),

    senderId: uuid('sender_id').notNull().references(() => users.id),
    recipientId: uuid('recipient_id').notNull().references(() => users.id),

    issueDate: timestamp('issue_date').notNull(),
    dueDate: timestamp('due_date').notNull(),
    paidDate: timestamp('paid_date'),

    subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
    taxTotal: decimal('tax_total', { precision: 12, scale: 2 }).notNull(),
    discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).default('0'),
    totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),

    currency: varchar('currency', { length: 3 }).default('USD').notNull(),
    notes: text('notes'),
    terms: text('terms'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    sentAt: timestamp('sent_at'),
    viewedAt: timestamp('viewed_at'),
});

// Invoice Items Table
export const invoiceItems = pgTable('invoice_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),

    description: varchar('description', { length: 500 }).notNull(),
    quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
    unitType: varchar('unit_type', { length: 50 }).notNull(), // hours, pieces, kg, litres, etc.
    unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
    taxRate: decimal('tax_rate', { precision: 5, scale: 4 }).notNull(), // e.g., 0.10 for 10%

    subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
    taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).notNull(),
    total: decimal('total', { precision: 12, scale: 2 }).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Payment Methods Table
export const paymentMethods = pgTable('payment_methods', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: paymentMethodTypeEnum('type').notNull(),

    // Card details
    cardLast4: varchar('card_last4', { length: 4 }),
    cardBrand: varchar('card_brand', { length: 50 }),
    cardExpMonth: integer('card_exp_month'),
    cardExpYear: integer('card_exp_year'),

    // Bank details
    accountLast4: varchar('account_last4', { length: 4 }),
    routingNumber: varchar('routing_number', { length: 50 }),

    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Payments Table
export const payments = pgTable('payments', {
    id: uuid('id').primaryKey().defaultRandom(),
    invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
    payerId: uuid('payer_id').notNull().references(() => users.id),

    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
    paymentMethodId: uuid('payment_method_id').references(() => paymentMethods.id),

    status: paymentStatusEnum('status').default('pending').notNull(),
    transactionId: varchar('transaction_id', { length: 255 }),

    paymentDate: timestamp('payment_date').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Notifications Table
export const notifications = pgTable('notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    invoiceId: uuid('invoice_id').references(() => invoices.id, { onDelete: 'cascade' }),

    type: notificationTypeEnum('type').notNull(),
    message: text('message').notNull(),
    isRead: boolean('is_read').default(false).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    sentInvoices: many(invoices, { relationName: 'sender' }),
    receivedInvoices: many(invoices, { relationName: 'recipient' }),
    paymentMethods: many(paymentMethods),
    payments: many(payments),
    notifications: many(notifications),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
    sender: one(users, {
        fields: [invoices.senderId],
        references: [users.id],
        relationName: 'sender',
    }),
    recipient: one(users, {
        fields: [invoices.recipientId],
        references: [users.id],
        relationName: 'recipient',
    }),
    items: many(invoiceItems),
    payments: many(payments),
    notifications: many(notifications),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
    invoice: one(invoices, {
        fields: [invoiceItems.invoiceId],
        references: [invoices.id],
    }),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one, many }) => ({
    user: one(users, {
        fields: [paymentMethods.userId],
        references: [users.id],
    }),
    payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
    invoice: one(invoices, {
        fields: [payments.invoiceId],
        references: [invoices.id],
    }),
    payer: one(users, {
        fields: [payments.payerId],
        references: [users.id],
    }),
    paymentMethod: one(paymentMethods, {
        fields: [payments.paymentMethodId],
        references: [paymentMethods.id],
    }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
    invoice: one(invoices, {
        fields: [notifications.invoiceId],
        references: [invoices.id],
    }),
}));