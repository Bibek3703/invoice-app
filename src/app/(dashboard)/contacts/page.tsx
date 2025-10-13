import Contacts from '@/components/dashboard/all-contacts';
import Invoices from '@/components/dashboard/all-invoices';
import Clients from '@/components/dashboard/clients';
import ReceivedInvoices from '@/components/dashboard/received-invoices';
import SentInvoices from '@/components/dashboard/sent-invoices';
import Vendors from '@/components/dashboard/vendors';
import Tabs from '@/components/tabs';
import { getUserCompanies } from '@/lib/actions/users';
import React from 'react'

async function ContactsPage() {
    const userId = '988d3e56-8605-4321-8785-9f4df995a769'; // For test only TODO: Get from auth

    const companies = await getUserCompanies(userId)

    if (!companies?.data || (companies?.data && companies?.data?.length === 0)) {
        return null // TODO: Display create company button
    }

    return (
        <div className='flex-1 flex flex-col h-full w-full p-4 lg:p-6'>
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Contacts</h1>
                <p className="text-muted-foreground mt-2">
                    A feature-rich data table with sorting, filtering, pagination, and drag-and-drop reordering.
                </p>
            </div>
            <Tabs
                defaultValue='clients'
                items={[
                    {
                        label: "Clients", value: "clients", content: <Clients
                            userId={userId}
                            companyId={companies?.data[0].id}
                        />
                    },
                    {
                        label: "Vendors", value: "vendors", content: <Vendors
                            userId={userId}
                            companyId={companies?.data[0].id}
                        />
                    },
                    {
                        label: "All contacts", value: "all", content: <Contacts
                            userId={userId}
                            companyId={companies?.data[0].id}
                        />
                    },
                ]}
            />
        </div>
    )
}

export default ContactsPage
