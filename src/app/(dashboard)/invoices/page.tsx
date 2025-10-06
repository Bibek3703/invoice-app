import ReceivedInvoices from '@/components/dashboard/received-invoices';
import Tabs from '@/components/tabs';
import React from 'react'

async function InvoicesPage() {
    const userId = '3d4aa90b-657a-4f2b-a874-0cab900fd225'; // For test only TODO: Get from auth


    return (
        <div className='flex-1 flex flex-col h-full w-full p-4 lg:p-6'>
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Invoices</h1>
                <p className="text-muted-foreground mt-2">
                    A feature-rich data table with sorting, filtering, pagination, and drag-and-drop reordering.
                </p>
            </div>
            <Tabs
                defaultValue='received'
                items={[
                    { label: "Received Invoices", value: "received", content: <ReceivedInvoices userId={userId} /> },
                    { label: "Sent Invoices", value: "sent", content: <div>Sent Invoices for user {userId}</div> },
                    { label: "All Invoices", value: "all", content: <div>All Invoices for user {userId}</div> },
                ]}
            />
        </div>
    )
}

export default InvoicesPage
