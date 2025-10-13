"use client"

import React from 'react'
import DataTable from './data-table';
import { sentInvoiceSchema, sentInvoiceColumns } from './columns';
import z from 'zod';
import { Button } from '../ui/button';
import TableToolbar from './data-table/table-toolbar';
import StatusFilter from './status-filter';
import { ColumnFiltersState, Row, Table } from '@tanstack/react-table';
import InvoiceDialog from './invoice-dialog';
import { useSentInvoices } from '@/hooks/use-invoices';

function SentInvoices({ userId, companyId }: { userId: string, companyId: string }) {
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = React.useState([{ id: 'createdAt', desc: true }]);
    const [searchQuery, setSearchQuery] = React.useState<string>('');
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    const { data: invoices, isLoading, isFetching } = useSentInvoices(companyId, {
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        columns: ["companyName", "recipientName", "totalAmount", "invoiceNumber"],
        search: searchQuery,
    });

    const renderToolbar = <TData extends { id: string }>(table: Table<TData>) => {

        return (
            <TableToolbar
                table={table}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                searchPlaceholder='Filter invoice number, recipient name, recipient company name, total amount...'
                onSearch={(value) => setSearchQuery(value)}
                extraActions={(table) => <>
                    <InvoiceDialog companyId={companyId} direction="outgoing" />
                    <StatusFilter table={table} />
                </>}
            />
        );
    }

    const onGlobalFilterChange = <TData extends { id: string }>(row: Row<TData>, columnId: string, filterValue: string): boolean => {
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
                rowCount={invoices?.pagination?.totalItems}
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
                isLoading={isLoading || isFetching}
                toolbar={renderToolbar}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                globalFilterFn={onGlobalFilterChange}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
            />
        </div>
    )
}

export default SentInvoices
