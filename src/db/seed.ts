import 'dotenv/config';
import { db } from '.'; // your drizzle db instance
import {
    users,
    invoices,
    invoiceItems,
    paymentMethods,
    payments,
    notifications
} from './schema';

async function seed() {
    console.log('🌱 Starting seed...');

    // Clear existing data (be careful in production!)
    await db.delete(notifications);
    await db.delete(payments);
    await db.delete(invoiceItems);
    await db.delete(invoices);
    await db.delete(paymentMethods);
    await db.delete(users);

    // Seed Users
    const [user1, user2, user3, user4] = await db.insert(users).values([
        {
            email: 'john.doe@techcorp.com',
            name: 'John Doe',
            companyName: 'TechCorp Solutions',
            phone: '+1-555-0101',
            address: {
                street: '123 Tech Street',
                city: 'San Francisco',
                state: 'CA',
                postalCode: '94102',
                country: 'USA'
            },
            taxId: 'US-123456789'
        },
        {
            email: 'sarah.smith@designstudio.com',
            name: 'Sarah Smith',
            companyName: 'Creative Design Studio',
            phone: '+1-555-0102',
            address: {
                street: '456 Creative Ave',
                city: 'New York',
                state: 'NY',
                postalCode: '10001',
                country: 'USA'
            },
            taxId: 'US-987654321'
        },
        {
            email: 'mike.johnson@consulting.com',
            name: 'Mike Johnson',
            companyName: 'Johnson Consulting Group',
            phone: '+1-555-0103',
            address: {
                street: '789 Business Blvd',
                city: 'Chicago',
                state: 'IL',
                postalCode: '60601',
                country: 'USA'
            },
            taxId: 'US-456789123'
        },
        {
            email: 'emma.wilson@marketing.com',
            name: 'Emma Wilson',
            companyName: 'Wilson Marketing Agency',
            phone: '+1-555-0104',
            address: {
                street: '321 Market Street',
                city: 'Austin',
                state: 'TX',
                postalCode: '73301',
                country: 'USA'
            },
            taxId: 'US-789123456'
        }
    ]).returning();

    console.log('✅ Users seeded');

    // Seed Payment Methods
    await db.insert(paymentMethods).values([
        {
            userId: user1.id,
            type: 'credit_card',
            cardLast4: '4242',
            cardBrand: 'Visa',
            cardExpMonth: 12,
            cardExpYear: 2026,
            isDefault: true
        },
        {
            userId: user2.id,
            type: 'credit_card',
            cardLast4: '5555',
            cardBrand: 'Mastercard',
            cardExpMonth: 8,
            cardExpYear: 2025,
            isDefault: true
        },
        {
            userId: user3.id,
            type: 'bank_account',
            accountLast4: '6789',
            routingNumber: '110000000',
            isDefault: true
        },
        {
            userId: user4.id,
            type: 'paypal',
            isDefault: true
        }
    ]);

    console.log('✅ Payment methods seeded');

    // Seed Invoices
    const [invoice1, invoice2, invoice3, invoice4, invoice5] = await db.insert(invoices).values([
        {
            invoiceNumber: 'INV-2025-0001',
            status: 'paid',
            senderId: user1.id,
            recipientId: user2.id,
            issueDate: new Date('2025-09-15'),
            dueDate: new Date('2025-10-15'),
            paidDate: new Date('2025-10-10'),
            subtotal: '5000.00',
            taxTotal: '500.00',
            discountAmount: '0.00',
            totalAmount: '5500.00',
            currency: 'USD',
            notes: 'Thank you for your business!',
            terms: 'Payment due within 30 days',
            sentAt: new Date('2025-09-15'),
            viewedAt: new Date('2025-09-16')
        },
        {
            invoiceNumber: 'INV-2025-0002',
            status: 'sent',
            senderId: user2.id,
            recipientId: user3.id,
            issueDate: new Date('2025-09-20'),
            dueDate: new Date('2025-10-20'),
            subtotal: '3200.00',
            taxTotal: '320.00',
            discountAmount: '200.00',
            totalAmount: '3320.00',
            currency: 'USD',
            notes: 'Design services for Q3 2025',
            terms: 'Net 30',
            sentAt: new Date('2025-09-20'),
            viewedAt: new Date('2025-09-21')
        },
        {
            invoiceNumber: 'INV-2025-0003',
            status: 'overdue',
            senderId: user3.id,
            recipientId: user4.id,
            issueDate: new Date('2025-08-15'),
            dueDate: new Date('2025-09-15'),
            subtotal: '8500.00',
            taxTotal: '850.00',
            discountAmount: '0.00',
            totalAmount: '9350.00',
            currency: 'USD',
            notes: 'Consulting services - August 2025',
            terms: 'Payment due within 30 days',
            sentAt: new Date('2025-08-15'),
            viewedAt: new Date('2025-08-16')
        },
        {
            invoiceNumber: 'INV-2025-0004',
            status: 'draft',
            senderId: user4.id,
            recipientId: user1.id,
            issueDate: new Date('2025-10-01'),
            dueDate: new Date('2025-11-01'),
            subtotal: '4200.00',
            taxTotal: '420.00',
            discountAmount: '100.00',
            totalAmount: '4520.00',
            currency: 'USD',
            notes: 'Marketing campaign services',
            terms: 'Net 30'
        },
        {
            invoiceNumber: 'INV-2025-0005',
            status: 'paid',
            senderId: user1.id,
            recipientId: user3.id,
            issueDate: new Date('2025-09-01'),
            dueDate: new Date('2025-10-01'),
            paidDate: new Date('2025-09-28'),
            subtotal: '12000.00',
            taxTotal: '1200.00',
            discountAmount: '500.00',
            totalAmount: '12700.00',
            currency: 'USD',
            notes: 'Software development - Phase 1',
            terms: 'Net 30',
            sentAt: new Date('2025-09-01'),
            viewedAt: new Date('2025-09-02')
        }
    ]).returning();

    console.log('✅ Invoices seeded');

    // Seed Invoice Items
    await db.insert(invoiceItems).values([
        // Invoice 1 items
        {
            invoiceId: invoice1.id,
            description: 'Web Development Services',
            quantity: '80',
            unitType: 'hours',
            unitPrice: '50.00',
            taxRate: '0.10',
            subtotal: '4000.00',
            taxAmount: '400.00',
            total: '4400.00'
        },
        {
            invoiceId: invoice1.id,
            description: 'Project Management',
            quantity: '20',
            unitType: 'hours',
            unitPrice: '50.00',
            taxRate: '0.10',
            subtotal: '1000.00',
            taxAmount: '100.00',
            total: '1100.00'
        },
        // Invoice 2 items
        {
            invoiceId: invoice2.id,
            description: 'Logo Design',
            quantity: '1',
            unitType: 'piece',
            unitPrice: '1500.00',
            taxRate: '0.10',
            subtotal: '1500.00',
            taxAmount: '150.00',
            total: '1650.00'
        },
        {
            invoiceId: invoice2.id,
            description: 'Brand Guidelines Document',
            quantity: '1',
            unitType: 'piece',
            unitPrice: '1000.00',
            taxRate: '0.10',
            subtotal: '1000.00',
            taxAmount: '100.00',
            total: '1100.00'
        },
        {
            invoiceId: invoice2.id,
            description: 'Marketing Materials Design',
            quantity: '10',
            unitType: 'hours',
            unitPrice: '70.00',
            taxRate: '0.10',
            subtotal: '700.00',
            taxAmount: '70.00',
            total: '770.00'
        },
        // Invoice 3 items
        {
            invoiceId: invoice3.id,
            description: 'Business Strategy Consulting',
            quantity: '40',
            unitType: 'hours',
            unitPrice: '150.00',
            taxRate: '0.10',
            subtotal: '6000.00',
            taxAmount: '600.00',
            total: '6600.00'
        },
        {
            invoiceId: invoice3.id,
            description: 'Market Research Report',
            quantity: '1',
            unitType: 'piece',
            unitPrice: '2500.00',
            taxRate: '0.10',
            subtotal: '2500.00',
            taxAmount: '250.00',
            total: '2750.00'
        },
        // Invoice 4 items
        {
            invoiceId: invoice4.id,
            description: 'Social Media Campaign Management',
            quantity: '3',
            unitType: 'months',
            unitPrice: '1200.00',
            taxRate: '0.10',
            subtotal: '3600.00',
            taxAmount: '360.00',
            total: '3960.00'
        },
        {
            invoiceId: invoice4.id,
            description: 'Content Creation',
            quantity: '20',
            unitType: 'posts',
            unitPrice: '30.00',
            taxRate: '0.10',
            subtotal: '600.00',
            taxAmount: '60.00',
            total: '660.00'
        },
        // Invoice 5 items
        {
            invoiceId: invoice5.id,
            description: 'Custom Software Development',
            quantity: '150',
            unitType: 'hours',
            unitPrice: '75.00',
            taxRate: '0.10',
            subtotal: '11250.00',
            taxAmount: '1125.00',
            total: '12375.00'
        },
        {
            invoiceId: invoice5.id,
            description: 'Software Testing',
            quantity: '10',
            unitType: 'hours',
            unitPrice: '75.00',
            taxRate: '0.10',
            subtotal: '750.00',
            taxAmount: '75.00',
            total: '825.00'
        }
    ]);

    console.log('✅ Invoice items seeded');

    // Seed Payments
    const [payment1, payment2] = await db.insert(payments).values([
        {
            invoiceId: invoice1.id,
            payerId: user2.id,
            amount: '5500.00',
            currency: 'USD',
            paymentMethod: 'credit_card',
            status: 'completed',
            transactionId: 'ch_1ABC123456789',
            paymentDate: new Date('2025-10-10')
        },
        {
            invoiceId: invoice5.id,
            payerId: user3.id,
            amount: '12700.00',
            currency: 'USD',
            paymentMethod: 'bank_account',
            status: 'completed',
            transactionId: 'ach_9XYZ987654321',
            paymentDate: new Date('2025-09-28')
        }
    ]).returning();

    console.log('✅ Payments seeded');

    // Seed Notifications
    await db.insert(notifications).values([
        {
            userId: user2.id,
            invoiceId: invoice1.id,
            type: 'invoice_sent',
            message: 'You received invoice INV-2025-0001 from TechCorp Solutions',
            isRead: true
        },
        {
            userId: user1.id,
            invoiceId: invoice1.id,
            type: 'payment_received',
            message: 'Payment received for invoice INV-2025-0001',
            isRead: true
        },
        {
            userId: user3.id,
            invoiceId: invoice2.id,
            type: 'invoice_sent',
            message: 'You received invoice INV-2025-0002 from Creative Design Studio',
            isRead: true
        },
        {
            userId: user4.id,
            invoiceId: invoice3.id,
            type: 'invoice_overdue',
            message: 'Invoice INV-2025-0003 is overdue',
            isRead: false
        },
        {
            userId: user3.id,
            invoiceId: invoice3.id,
            type: 'reminder',
            message: 'Reminder: Invoice INV-2025-0003 payment is overdue',
            isRead: false
        },
        {
            userId: user3.id,
            invoiceId: invoice5.id,
            type: 'invoice_sent',
            message: 'You received invoice INV-2025-0005 from TechCorp Solutions',
            isRead: true
        },
        {
            userId: user1.id,
            invoiceId: invoice5.id,
            type: 'payment_received',
            message: 'Payment received for invoice INV-2025-0005',
            isRead: true
        }
    ]);

    console.log('✅ Notifications seeded');

    console.log('🎉 Seed completed successfully!');
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