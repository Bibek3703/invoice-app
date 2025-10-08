"use client"

import { useInvoices } from '@/hooks/use-invoices';
import React from 'react'
import DataTable from './data-table';
import { sentInvoiceSchema, sentInvoiceColumns } from './columns';
import z from 'zod';
import { Button } from '../ui/button';
import TableToolbar from './data-table/table-toolbar';
import StatusFilter from './status-filter';
import { IconPlus } from '@tabler/icons-react';
import { Row, Table } from '@tanstack/react-table';

function SentInvoices({ userId }: { userId: string }) {
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
        type: "sent",
        search: searchQuery,
    });

    function renderToolbar<TData extends { id: string }>(table: Table<TData>) {
        return (
            <TableToolbar
                table={table}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                searchPlaceholder='Filter invoice number, recipient name, recipient company name, total amount...'
                onSearch={(value) => setSearchQuery(value)}
                extraActions={(table) => <>
                    <Button variant="outline" size="sm" onClick={() => { }}>
                        <IconPlus />
                        <span className="hidden lg:inline">Create Invoice</span>
                    </Button>
                    <StatusFilter table={table} />
                </>}
            />
        );
    }

    const onGlobalFilterChange = <TData,>(row: Row<TData>, columnId: string, filterValue: string): boolean => {
        const search = filterValue.toLowerCase()
        const invoiceNumber = String(row.getValue("invoiceNumber")).toLowerCase()
        const recipientName = String(row.getValue("recipient_name")).toLowerCase()
        const companyName = String(row.getValue("recipient_companyName")).toLowerCase()
        const totalAmount = String(row.getValue("totalAmount"))
        return invoiceNumber.includes(search) ||
            recipientName.includes(search) ||
            totalAmount.includes(search) ||
            companyName.includes(search)
    }

    return (
        <div className='flex-1 h-full w-full'>
            <DataTable
                data={invoices?.data as unknown as z.infer<typeof sentInvoiceSchema>[] ?? []}
                rowCount={invoices?.pagination?.total}
                columns={sentInvoiceColumns}
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
                toolbar={renderToolbar}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                globalFilterFn={onGlobalFilterChange}
            />
        </div>
    )
}

export default SentInvoices
