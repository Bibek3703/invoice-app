import { relations } from 'drizzle-orm';
import { pgTable, uuid, varchar, text, timestamp, decimal, integer, boolean, jsonb, pgEnum, unique } from 'drizzle-orm/pg-core';

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
    'stripe',
    'cash'
]);

export const notificationTypeEnum = pgEnum('notification_type', [
    'invoice_sent',
    'invoice_viewed',
    'payment_received',
    'invoice_overdue',
    'reminder'
]);

export const contactTypeEnum = pgEnum('contact_type', [
    'client',
    'vendor'
]);

export const userTypeEnum = pgEnum('user_type', [
    'individual',
    'freelancer',
    'business'
]);

export const sourceTypeEnum = pgEnum('source_type', [
    'manual',
    'csv',
    'excel'
]);

export const directionTypeEnum = pgEnum('direction_type', [
    'outgoing',
    'incoming',
]);

export type AddressType = {
    street: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

// Users Table
export const users = pgTable("users", {
    id: text("id").primaryKey(), // NextAuth compatible
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    role: varchar("role", { length: 50 }).default("user").notNull(),
    userType: userTypeEnum("type").default("individual").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


// Companies Table
export const companies = pgTable('companies', {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: text("owner_id").references(() => users.id, { onDelete: "cascade" }),

    // Basic Contact Information
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }),
    mobilePhone: varchar('mobile_phone', { length: 50 }),
    website: varchar('website', { length: 255 }),

    // Company Information
    companyRegistrationNumber: varchar('company_registration_number', { length: 100 }),
    taxId: varchar('tax_id', { length: 100 }),
    vatNumber: varchar('vat_number', { length: 100 }),

    // Address Information
    address: jsonb('address').$type<AddressType>(),

    // Billing Address (if different from main address)
    billingAddress: jsonb('billing_address').$type<AddressType>(),

    // Additional Information
    industry: varchar('industry', { length: 100 }),
    companySize: varchar('company_size', { length: 50 }), // e.g., "1-10", "11-50", "51-200"
    notes: text('notes'),

    // Metadata
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Contacts Table
export const contacts = pgTable('contacts', {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }),
    mobilePhone: varchar('mobile_phone', { length: 50 }),
    contactType: contactTypeEnum("contact_type").notNull(),
    isRegisteredUser: boolean("is_registered_user").default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ([
    unique("company_email_type_unique").on(
        table.companyId,
        table.email,
        table.contactType,
    ),
]),
);

// Invoices Table
export const invoices = pgTable('invoices', {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),

    senderId: uuid("sender_id").references(() => contacts.id, {
        onDelete: "set null",
    }),

    recipientId: uuid("recipient_id").references(() => contacts.id, {
        onDelete: "set null",
    }),

    invoiceNumber: varchar('invoice_number', { length: 100 }).notNull().unique(),
    status: invoiceStatusEnum('status').default('draft').notNull(),
    direction: directionTypeEnum("direction").default("outgoing").notNull(),

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
    source: sourceTypeEnum("source").notNull().default('manual'),
    externalId: varchar("external_id", { length: 100 }),

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
    companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
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
    companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
    invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
    payerId: uuid('payer_id').references(() => contacts.id),
    payerName: varchar('payer_name', { length: 255 }),

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
    companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
    invoiceId: uuid('invoice_id').references(() => invoices.id, { onDelete: 'cascade' }),

    type: notificationTypeEnum('type').notNull(),
    message: text('message').notNull(),
    isRead: boolean('is_read').default(false).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations

// Users
export const usersRelations = relations(users, ({ many }) => ({
    companies: many(companies),
}));

// Companies
export const companiesRelations = relations(companies, ({ one, many }) => ({
    owner: one(users, { fields: [companies.ownerId], references: [users.id] }),
    contacts: many(contacts),
    invoices: many(invoices),
    payments: many(payments),
    paymentMethods: many(paymentMethods),
    notifications: many(notifications),
}));

// Contacts
export const contactsRelations = relations(contacts, ({ one, many }) => ({
    company: one(companies, { fields: [contacts.companyId], references: [companies.id] }),
    sentInvoices: many(invoices),
    receivedInvoices: many(invoices),
    payments: many(payments),
}));

// Invoices
export const invoicesRelations = relations(invoices, ({ one, many }) => ({
    company: one(companies, { fields: [invoices.companyId], references: [companies.id] }),
    sender: one(contacts, { fields: [invoices.senderId], references: [contacts.id] }),
    recipient: one(contacts, { fields: [invoices.recipientId], references: [contacts.id] }),
    items: many(invoiceItems),
    payments: many(payments),
    notifications: many(notifications),
}));

// Invoice Items
export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
    invoice: one(invoices, { fields: [invoiceItems.invoiceId], references: [invoices.id] }),
}));

// Payments
export const paymentsRelations = relations(payments, ({ one }) => ({
    company: one(companies, { fields: [payments.companyId], references: [companies.id] }),
    invoice: one(invoices, { fields: [payments.invoiceId], references: [invoices.id] }),
    payer: one(contacts, { fields: [payments.payerId], references: [contacts.id] }),
    paymentMethod: one(paymentMethods, { fields: [payments.paymentMethodId], references: [paymentMethods.id] }),
}));

// Notifications
export const notificationsRelations = relations(notifications, ({ one }) => ({
    company: one(companies, { fields: [notifications.companyId], references: [companies.id] }),
    invoice: one(invoices, { fields: [notifications.invoiceId], references: [invoices.id] }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type NewPaymentMethod = typeof paymentMethods.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
