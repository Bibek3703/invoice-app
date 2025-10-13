import 'dotenv/config';
import { db } from '.'; // your drizzle db instance
import { faker } from '@faker-js/faker';
import { companies, Company, Contact, contacts, Invoice, invoiceItems, invoices, NewCompany, NewContact, NewInvoice, NewInvoiceItem, NewNotification, NewPayment, NewPaymentMethod, NewUser, notifications, notificationTypeEnum, PaymentMethod, paymentMethods, payments, User, users } from './schema';
import { randomElement } from '@/lib/utils';

async function createUsers() {
    // 1️⃣ Create Users
    const newUsers: NewUser[] = [];
    for (let i = 0; i < 5; i++) {
        const userId = faker.string.uuid();
        newUsers.push({
            id: userId,
            name: faker.person.fullName(),
            email: faker.internet.email(),
            role: 'user',
            userType: randomElement(['individual', 'freelancer', 'business'] as const),
        });

    }
    return await db.insert(users).values(newUsers).returning();
}

async function createCompanies(userIds: string[]) {
    // 2️⃣ Create Companies
    const newCompanys: NewCompany[] = [];
    for (let i = 0; i < 10; i++) {
        newCompanys.push({
            ownerId: randomElement(userIds),
            name: faker.company.name(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            website: faker.internet.url(),
            address: {
                street: faker.location.street(),
                city: faker.location.city(),
                state: faker.location.state(),
                postalCode: faker.location.zipCode(),
                country: faker.location.country(),
            },
        });
    }
    return await db.insert(companies).values(newCompanys).returning();
}

async function createContacts(companyIds: string[]) {
    // 3️⃣ Create Contacts (clients/vendors)
    const newContacts: NewContact[] = [];
    for (let i = 0; i < 30; i++) {
        newContacts.push({
            companyId: randomElement(companyIds),
            name: faker.person.fullName(),
            email: faker.internet.email(),
            contactType: randomElement(['client', 'vendor'] as const),
            isRegisteredUser: faker.datatype.boolean(),
            phone: faker.phone.number(),
        });
    }
    return await db.insert(contacts).values(newContacts).returning();
}

async function createPaymentMethods(companyIds: string[]) {
    // 4️⃣ Create Payment Methods
    const newPaymentMethods: NewPaymentMethod[] = [];
    for (const companyId of companyIds) {
        newPaymentMethods.push({
            companyId,
            type: randomElement(['credit_card', 'paypal', 'bank_account'] as const),
            isDefault: true,
        });
    }
    return await db.insert(paymentMethods).values(newPaymentMethods).returning();
}



export async function createInvoices(
    companies: Company[],
    contacts: Contact[],
    paymentMethods: PaymentMethod[]
) {
    const newInvoices: NewInvoice[] = [];
    const newInvoiceItems: NewInvoiceItem[] = [];
    const newInvoicePayments: NewPayment[] = [];
    const newInvoiceNotifications: NewNotification[] = [];

    for (let i = 0; i < 50; i++) {
        const companyId = randomElement(companies.map((item) => item.id));
        const contactIds = contacts.map((item) => item.id)
        const senderId = randomElement(contactIds);

        // Ensure recipient ≠ sender
        let recipientId = randomElement(contactIds.filter((item) => item !== senderId));

        const issueDate = faker.date.past();
        const dueDate = new Date(issueDate.getTime() + faker.number.int({ min: 7, max: 30 }) * 86400000);

        let subtotal = 0;
        const itemCount = faker.number.int({ min: 1, max: 5 });

        const invoiceId = faker.string.uuid();

        for (let j = 0; j < itemCount; j++) {
            const quantity = faker.number.int({ min: 1, max: 10 });
            const unitPrice = faker.number.int({ min: 10, max: 500 });
            const subtotalItem = quantity * unitPrice;
            const taxItem = subtotalItem * 0.1;
            const totalItem = subtotalItem + taxItem;

            subtotal += subtotalItem;

            newInvoiceItems.push({
                invoiceId,
                description: faker.commerce.productDescription(),
                quantity: String(quantity),
                unitType: 'pcs',
                unitPrice: String(unitPrice),
                taxRate: '0.1',
                subtotal: String(subtotalItem),
                taxAmount: String(taxItem),
                total: String(totalItem),
            });
        }

        const taxTotal = subtotal * 0.1;
        const totalAmount = subtotal + taxTotal;
        const status = randomElement(['paid', 'sent', 'viewed', 'draft', 'overdue'] as const);

        invoiceNumber: `INV-${1000 + i}`

        newInvoices.push({
            id: invoiceId,
            companyId,
            senderId,
            recipientId,
            invoiceNumber: `INV-${1000 + i}`,
            status,
            direction: randomElement(['incoming', 'outgoing'] as const),
            issueDate,
            dueDate,
            subtotal: String(subtotal),
            taxTotal: String(taxTotal),
            totalAmount: String(totalAmount),
            currency: 'USD',
            source: 'manual',
        });

        // Paid invoices → add payment
        if (status === 'paid') {
            const paymentType = randomElement([
                'credit_card',
                'bank_account',
                'paypal',
                'stripe',
                'cash',
            ] as const);

            let payerId = null

            const recepient = contacts.find((item) => item.id === recipientId)

            if (recepient?.companyId) {
                payerId = recipientId
            }

            const paymentMethod = paymentMethods.find((item) => item.companyId === companyId && item.type === paymentType)

            let paymentMethodId = null;

            if (paymentMethod) {
                paymentMethodId = paymentMethod.id
            }



            newInvoicePayments.push({
                companyId,
                invoiceId,
                payerId,
                payerName: !payerId ? randomElement([faker.company.name(), faker.person.fullName()]) : null,
                amount: String(totalAmount),
                currency: 'USD',
                paymentMethod: paymentType,
                paymentMethodId,
                transactionId: paymentType === 'cash' ? null : faker.string.alphanumeric(10),
                status: 'completed',
                paymentDate: new Date(),
                createdAt: new Date(),
            });

            newInvoiceNotifications.push({
                id: faker.string.uuid(),
                companyId: companyId,
                invoiceId: invoiceId,
                type: 'payment_received',
                message: `Payment of ${totalAmount} USD received.`,
                isRead: faker.datatype.boolean(),
                createdAt: faker.date.recent(),
            });
        }
        const typesForInvoice: Array<typeof notificationTypeEnum.enumValues[number]> = [];

        switch (status) {
            case 'draft':
                // maybe no notification
                break;
            case 'sent':
                typesForInvoice.push('invoice_sent');
                break;
            case 'viewed':
                typesForInvoice.push('invoice_viewed');
                break;
            case 'overdue':
                typesForInvoice.push('invoice_overdue', 'reminder');
                break;
            case 'paid':
                typesForInvoice.push('payment_received');
                break;
        }

        for (const type of typesForInvoice) {
            newInvoiceNotifications.push({
                id: faker.string.uuid(),
                companyId: companyId,
                invoiceId: invoiceId,
                type,
                message: faker.lorem.sentence(),
                isRead: faker.datatype.boolean(),
                createdAt: faker.date.recent(),
            });
        }
    }

    await db.insert(invoices).values(newInvoices);
    console.log('✅ Invoices seeded');
    await db.insert(invoiceItems).values(newInvoiceItems);
    console.log('✅ Invoice items seeded');
    await db.insert(payments).values(newInvoicePayments);
    console.log('✅ Payments seeded');
    await db.insert(notifications).values(newInvoiceNotifications);
    console.log('✅ Notifications seeded');
}


async function seed() {
    console.log('🌱 Starting seed...');

    // Clear existing data (be careful in production!)
    await db.delete(notifications);
    await db.delete(payments);
    await db.delete(invoiceItems);
    await db.delete(invoices);
    await db.delete(paymentMethods);
    await db.delete(contacts);
    await db.delete(companies);
    await db.delete(users);

    console.log('✅ Tables cleared');

    const newUsers = (await createUsers()) as unknown as User[]
    console.log('✅ Users seeded');

    const userIds = newUsers.map((item) => item.id)
    const newCompanies = (await createCompanies(userIds)) as unknown as Company[]
    console.log('✅ Companies seeded');

    const companyIds = newCompanies.map((item) => item.id)
    const newContacts = (await createContacts(companyIds)) as unknown as Contact[]
    console.log('✅ Contacts seeded');

    const newPaymentMethods = (await createPaymentMethods(companyIds)) as unknown as PaymentMethod[]
    console.log('✅ Payment methods seeded');

    await createInvoices(newCompanies, newContacts, newPaymentMethods)
}

// Run the seed
seed()
    .catch((error) => {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    })
    .finally(() => {
        process.exit(0);
    });