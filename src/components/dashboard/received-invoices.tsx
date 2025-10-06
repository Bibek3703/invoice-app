"use client"

import { useInvoices } from '@/hooks/use-invoices';
import React from 'react'
import DataTable from './data-table';
import { receivedInvoiceSchema, receivedInvoiceColumns } from './columns';
import z from 'zod';
import TableToolbar from './data-table/table-toolbar';
import { Button } from '../ui/button';
import StatusFilter from './status-filter';
import { ColumnFiltersRow, ColumnFiltersState } from '@tanstack/react-table';

function ReceivedInvoices({ userId }: { userId: string }) {
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = React.useState([{ id: 'createdAt', desc: true }]);
    const [statusFilter, setStatusFilter] = React.useState<string>('all');
    const [searchQuery, setSearchQuery] = React.useState<string>('');
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    const { data: invoices, isLoading, isFetching } = useInvoices(userId, {
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        status: statusFilter,
        type: "received",
        search: searchQuery,
    });

    return (
        <div className='w-full flex-col justify-start gap-6'>
            <DataTable
                data={invoices?.data as unknown as z.infer<typeof receivedInvoiceSchema>[] ?? []}
                rowCount={invoices?.pagination?.total}
                columns={receivedInvoiceColumns}
                pagination={pagination}
                setPagination={setPagination}
                sorting={sorting}
                setSorting={setSorting}
                toolbar={(table) => <TableToolbar
                    table={table}
                    globalFilter={globalFilter}
                    setGlobalFilter={setGlobalFilter}
                    searchPlaceholder='Filter invoice number, sender name, sender company name, total amount...'
                    onSearch={(value) => setSearchQuery(value)}
                    extraActions={(table) => <>
                        {/* <Button variant="outline" size="sm" onClick={onAddSection}>
                            <IconPlus />
                            <span className="hidden lg:inline">Add Section</span>
                        </Button> */}
                        <StatusFilter table={table} />
                    </>
                    }
                />}
                emptyTitle='No Received Invoices'
                emptyDescription='You have not received any invoices yet.'
                emptyAction={<Button>Import Invoice</Button>}
                isLoading={isLoading || isFetching}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                globalFilterFn={(row, columnId, filterValue) => {
                    const search = filterValue.toLowerCase()
                    const invoiceNumber = String(row.getValue("invoiceNumber")).toLowerCase()
                    const senderName = String(row.getValue("sender_name")).toLowerCase()
                    const totalAmount = String(row.getValue("totalAmount"))
                    const companyName = String(row.getValue("sender_companyName")).toLowerCase()

                    return invoiceNumber.includes(search) || senderName.includes(search) || totalAmount.includes(search) || companyName.includes(search)
                }}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
            />
        </div>
    )
}

export default ReceivedInvoices
