import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { IconChevronDown, IconLayoutColumns, IconSearch } from '@tabler/icons-react'
import { Table } from '@tanstack/react-table'
import React from 'react'

function TableToolbar<TData extends & { id: string }>({
    table,
    setGlobalFilter = () => { },
    globalFilter,
    searchPlaceholder = "Filter...",
    onSearch = () => { },
    extraActions
}: {
    table: Table<TData>
    globalFilter?: string
    setGlobalFilter?: React.Dispatch<React.SetStateAction<string>>
    searchPlaceholder?: string
    onSearch?: (value: string) => void
    extraActions?: (table: Table<TData>) => React.ReactNode
}) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
            <div className="flex-1 flex items-center justify-between">
                <Input
                    placeholder={searchPlaceholder}
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="min-w-max focus-visible:ring-0"
                />
                <Button
                    type="submit"
                    variant="outline"
                    size={"icon"}
                    className="ml-2"
                    onClick={() => onSearch(globalFilter ?? "")}>
                    <IconSearch />
                </Button>
            </div>
            <div className="flex items-center gap-2">
                {extraActions ? extraActions(table) : null}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <IconLayoutColumns />
                            <span className="hidden lg:inline">Customize Columns</span>
                            <span className="lg:hidden">Columns</span>
                            <IconChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        {table
                            .getAllColumns()
                            .filter(
                                (column) =>
                                    typeof column.accessorFn !== "undefined" &&
                                    column.getCanHide()
                            )
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}

export default TableToolbar
