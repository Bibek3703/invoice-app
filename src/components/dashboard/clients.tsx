"use client"

import React from 'react'
import DataTable from './data-table';
import z from 'zod';
import { Button } from '../ui/button';
import TableToolbar from './data-table/table-toolbar';
import { ColumnFiltersState, Row, Table } from '@tanstack/react-table';
import { contactColumns, contactSchema } from './columns/contacts';
import { useClients } from '@/hooks/use-contacts';

function Clients({ userId, companyId }: { userId: string, companyId: string }) {
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = React.useState([{ id: 'createdAt', desc: true }]);
    const [searchQuery, setSearchQuery] = React.useState<string>('');
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    const { data: contacts, isLoading, isFetching } = useClients(companyId, {
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        columns: ["name", "email", "phone", "mobilePhone", "companyName"],
        search: searchQuery,
    });

    const renderToolbar = <TData extends { id: string }>(table: Table<TData>) => {
        return <TableToolbar
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            searchPlaceholder='Filter name, email, company name, phone...'
            onSearch={(value) => setSearchQuery(value)
            }
        />
    }

    const onGlobalFilterChange = <TData extends { id: string }>(row: Row<TData>, columnId: string, filterValue: string): boolean => {
        const search = filterValue.toLowerCase()
        const name = String(row.getValue("name")).toLowerCase()
        const email = String(row.getValue("email")).toLowerCase()
        const phone = String(row.getValue("phone")).toLowerCase()
        const companyName = String(row.getValue("company_name")).toLowerCase()
        return name.includes(search) ||
            email.includes(search) ||
            phone.includes(search) ||
            companyName.includes(search)
    }

    return (
        <div className='flex-1 h-full w-full' >
            <DataTable
                data={contacts?.data as unknown as z.infer<typeof contactSchema>[] ?? []}
                rowCount={contacts?.pagination?.totalItems}
                columns={contactColumns}
                pagination={pagination}
                setPagination={setPagination}
                sorting={sorting}
                setSorting={setSorting}
                toolbar={renderToolbar}
                emptyTitle='No Client Yet'
                emptyDescription="You haven't created any client yet. Get started by creating your first client."
                emptyAction={< div className="flex gap-2" >
                    <Button>Create Client </Button>
                    < Button variant="outline" > Import Contacts </Button>
                </div>}
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

export default Clients
