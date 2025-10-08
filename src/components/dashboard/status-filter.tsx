import React from 'react'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { IconChevronDown, IconFilter2 } from '@tabler/icons-react'
import { Button } from '../ui/button'
import { Table } from '@tanstack/react-table'
import { invoiceStatusEnum } from '@/db/schema'

export const invoiceStatusOptions = invoiceStatusEnum.enumValues.map((status) => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
}));

function StatusFilter<TData extends & { id: string }>({ table }: { table: Table<TData> }) {

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <IconFilter2 />
                    <span className="">Status</span>
                    <IconChevronDown />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {invoiceStatusOptions.map((status) => {
                    return (
                        <DropdownMenuCheckboxItem
                            key={status.value}
                            className="capitalize"
                            checked={(table.getColumn("status")?.getFilterValue() as string) === status.value}
                            onCheckedChange={(value) => {
                                if (value) {
                                    table.getColumn("status")?.setFilterValue(status.value)
                                } else {
                                    table.getColumn("status")?.setFilterValue(undefined)
                                }
                            }}
                        >
                            {status.label}
                        </DropdownMenuCheckboxItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default StatusFilter
