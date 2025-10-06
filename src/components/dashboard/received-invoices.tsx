"use client"

import { useInvoices } from '@/hooks/use-invoices';
import React from 'react'
import DataTable from './data-table';
import { columns, schema } from './invoice-columns';
import z from 'zod';

function ReceivedInvoices({ userId }: { userId: string }) {
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = React.useState([{ id: 'createdAt', desc: true }]);
    const [statusFilter, setStatusFilter] = React.useState<string>('all');
    const [searchQuery, setSearchQuery] = React.useState<string>('');

    const { data, isLoading } = useInvoices(userId, {
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        status: statusFilter,
        type: "received",
        search: searchQuery,
    });


    return (
        <div className='flex-1 h-full w-full'>
            <DataTable
                data={data as unknown as z.infer<typeof schema>[] ?? []}
                columns={columns}
                pagination={pagination}
                setPagination={setPagination}
                sorting={sorting}
                setSorting={setSorting}
            />
        </div>
    )
}

export default ReceivedInvoices
