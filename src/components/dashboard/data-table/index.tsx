import React from 'react'
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    Row,
    SortingState,
    Table as ReactTable,
    useReactTable,
    VisibilityState,
    FilterFnOption,
    OnChangeFn
} from "@tanstack/react-table"
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { IconFileText } from '@tabler/icons-react'
import Link from 'next/link'
import { ArrowUpRightIcon } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { TablePagination } from './table-pagination'

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    pagination?: PaginationState
    setPagination: React.Dispatch<React.SetStateAction<PaginationState>>
    sorting?: SortingState
    setSorting?: React.Dispatch<React.SetStateAction<SortingState>>
    toolbar?: (table: ReactTable<TData>) => React.ReactNode
    emptyTitle?: string
    emptyDescription?: string
    emptyAction?: React.ReactNode
    isLoading?: boolean
    rowCount?: number
    globalFilterFn?: FilterFnOption<TData> | undefined
    globalFilter?: string
    setGlobalFilter?: React.Dispatch<React.SetStateAction<string>>
    columnFilters?: ColumnFiltersState
    setColumnFilters?: OnChangeFn<ColumnFiltersState>
}

function DraggableRow<TData extends { id: string }>({
    row,
}: {
    row: Row<TData>
}) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.id,
    })

    return (
        <TableRow
            data-state={row.getIsSelected() && "selected"}
            data-dragging={isDragging}
            ref={setNodeRef}
            className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
            style={{
                transform: CSS.Transform.toString(transform),
                transition: transition,
            }}
        >
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
            ))}
        </TableRow>
    )
}

function DataTable<TData extends { id: string }, TValue>({
    columns,
    data: initialData,
    rowCount,
    pagination = {
        pageIndex: 0,
        pageSize: 10,
    },
    setPagination,
    sorting = [{ id: 'createdAt', desc: true }],
    setSorting,
    toolbar,
    emptyTitle,
    emptyDescription,
    emptyAction,
    isLoading = false,
    globalFilter = "",
    globalFilterFn,
    setGlobalFilter,
    columnFilters = [],
    setColumnFilters = () => { }

}: DataTableProps<TData, TValue>) {
    const [data, setData] = React.useState(() => initialData)
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const sortableId = React.useId()
    const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}))

    const dataIds = React.useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id) || [], [data])

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
            globalFilter
        },
        rowCount: rowCount ?? data?.length,
        getRowId: (row: TData) => row.id.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        manualPagination: true,
        manualSorting: true,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn,
    })

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (active && over && active.id !== over.id) {
            setData((data) => {
                const oldIndex = dataIds.indexOf(active.id)
                const newIndex = dataIds.indexOf(over.id)
                return arrayMove(data, oldIndex, newIndex)
            })
        }
    }

    React.useEffect(() => {
        if (initialData?.length > 0) {
            setData(initialData)
        }
    }, [initialData])

    return (
        <div className="w-full flex flex-col justify-start gap-6">
            {toolbar && toolbar(table)}
            <DndContext
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleDragEnd}
                sensors={sensors}
                id={sortableId}
            >
                <Table className='flex-1 h-full w-full'>
                    <TableHeader className="bg-muted sticky top-0 z-10">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} colSpan={header.colSpan}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="**:data-[slot=table-cell]:first:w-8">
                        {isLoading ? <TableRow>
                            <TableCell colSpan={columns.length} className="h-full text-center">
                                <Empty className="w-full">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <Spinner />
                                        </EmptyMedia>
                                        <EmptyTitle>Processing your request</EmptyTitle>
                                        <EmptyDescription>
                                            Please wait while we process your request. Do not refresh the page.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                    <EmptyContent>
                                        <Button variant="outline" size="sm">
                                            Cancel
                                        </Button>
                                    </EmptyContent>
                                </Empty>
                            </TableCell>
                        </TableRow> : table.getRowModel().rows?.length ? (
                            <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                                {table.getRowModel().rows.map((row) => (
                                    <DraggableRow key={row.id} row={row} />
                                ))}
                            </SortableContext>
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-full text-center">
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <IconFileText />
                                            </EmptyMedia>
                                        </EmptyHeader>
                                        <EmptyTitle>{emptyTitle}</EmptyTitle>
                                        {emptyDescription && <EmptyDescription>
                                            {emptyDescription}
                                        </EmptyDescription>}
                                        {emptyAction && <EmptyContent>
                                            {/* */}
                                            {emptyAction}
                                        </EmptyContent>}
                                        <Button
                                            variant="link"
                                            asChild
                                            className="text-muted-foreground"
                                            size="sm"
                                        >
                                            <Link href="#">
                                                Learn More <ArrowUpRightIcon />
                                            </Link>
                                        </Button>
                                    </Empty>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </DndContext>
            <TablePagination table={table} />
        </div>
    )
}

export default DataTable
