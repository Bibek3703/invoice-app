"use client"

import { useReceivedInvoices } from '@/hooks/use-invoices';
import React from 'react'
import DataTable from './data-table';
import { receivedInvoiceSchema, receivedInvoiceColumns } from './columns';
import z from 'zod';
import TableToolbar from './data-table/table-toolbar';
import { Button } from '../ui/button';
import { ColumnFiltersState, Row, Table } from '@tanstack/react-table';
import StatusFilter from './status-filter';

function ReceivedInvoices({ userId, companyId }: { userId: string, companyId: string }) {
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = React.useState([{ id: 'createdAt', desc: true }]);
    const [searchQuery, setSearchQuery] = React.useState<string>('');
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    const { data: invoices, isLoading, isFetching } = useReceivedInvoices(companyId, {
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        columns: ["companyName", "totalAmount", "senderName", "invoiceNumber"],
        search: searchQuery,
    });

    const renderToolbar = <TData extends { id: string }>(table: Table<TData>) => {

        return <TableToolbar
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            searchPlaceholder='Filter invoice number, recipient name, company name, total amount...'
            onSearch={(value) => setSearchQuery(value)}
            extraActions={(table) => <>
                <StatusFilter table={table} />
            </>}
        />
    }

    const onGlobalFilterChange = <TData extends { id: string }>(row: Row<TData>, columnId: string, filterValue: string): boolean => {
        const search = filterValue.toLowerCase()
        const invoiceNumber = String(row.getValue("invoiceNumber")).toLowerCase()
        const senderName = String(row.getValue("sender_name")).toLowerCase()
        const totalAmount = String(row.getValue("totalAmount"))
        const companyName = String(row.getValue("sender_company_name")).toLowerCase()

        return invoiceNumber.includes(search) ||
            senderName.includes(search) ||
            totalAmount.includes(search) ||
            companyName.includes(search)
    }

    console.log({ invoices })

    return (
        <div className='w-full flex-col justify-start gap-6'>
            <DataTable
                data={invoices?.data as unknown as z.infer<typeof receivedInvoiceSchema>[] ?? []}
                rowCount={invoices?.pagination?.totalItems}
                columns={receivedInvoiceColumns}
                pagination={pagination}
                setPagination={setPagination}
                sorting={sorting}
                setSorting={setSorting}
                toolbar={renderToolbar}
                emptyTitle='No Received Invoices'
                emptyDescription='You have not received any invoices yet.'
                emptyAction={<Button>Import Invoice</Button>}
                isLoading={isLoading || isFetching}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                globalFilterFn={onGlobalFilterChange}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
            />
        </div>
    )
}

export default ReceivedInvoices
