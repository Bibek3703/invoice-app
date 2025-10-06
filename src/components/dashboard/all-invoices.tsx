"use client"

import { useInvoices } from '@/hooks/use-invoices';
import React from 'react'
import DataTable from './data-table';
import { allInvoiceSchema, allInvoiceColumns } from './columns';
import z from 'zod';
import { Button } from '../ui/button';
import TableToolbar from './data-table/table-toolbar';

function Invoices({ userId }: { userId: string }) {
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = React.useState([{ id: 'createdAt', desc: true }]);
    const [statusFilter, setStatusFilter] = React.useState<string>('all');
    const [searchQuery, setSearchQuery] = React.useState<string>('');
    const [globalFilter, setGlobalFilter] = React.useState("")

    const { data: invoices, isLoading } = useInvoices(userId, {
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        status: statusFilter,
        type: "all",
        search: searchQuery,
    });


    return (
        <div className='flex-1 h-full w-full'>
            <DataTable
                data={invoices?.data as unknown as z.infer<typeof allInvoiceSchema>[] ?? []}
                rowCount={invoices?.pagination?.total}
                columns={allInvoiceColumns}
                pagination={pagination}
                setPagination={setPagination}
                sorting={sorting}
                setSorting={setSorting}
                emptyTitle='No Invoices Yet'
                emptyDescription="You haven't created any invoices yet. Get started by creating your first invoice."
                emptyAction={<div className="flex gap-2">
                    <Button>Create Invoice</Button>
                    <Button variant="outline">Import Invoice</Button>
                </div>}
                isLoading={isLoading}
                toolbar={(table) => <TableToolbar
                    table={table}
                    globalFilter={globalFilter}
                    setGlobalFilter={setGlobalFilter}
                    searchPlaceholder='Filter invoice number, recipient name, company name, total amount...'
                    onSearch={(value) => setSearchQuery(value)}
                />}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                globalFilterFn={(row, columnId, filterValue) => {
                    const search = filterValue.toLowerCase()
                    const invoiceNumber = String(row.getValue("invoiceNumber")).toLowerCase()
                    const recipientName = String(row.getValue("recipient_name")).toLowerCase()
                    const senderCompanyName = String(row.getValue("sender_companyName")).toLowerCase()
                    const totalAmount = String(row.getValue("totalAmount"))

                    return invoiceNumber.includes(search) || recipientName.includes(search) || totalAmount.includes(search) || senderCompanyName.includes(search)
                }}
            />
        </div>
    )
}

export default Invoices
