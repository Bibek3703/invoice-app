import { ColumnDef } from '@tanstack/react-table'
import { email, z } from 'zod'
import { Checkbox } from '../ui/checkbox';
import DragHandle from './data-table/drag-handle';

export const schema = z.object({
    id: z.string(),
    invoiceNumber: z.string(),
    recipient: z.object({
        id: z.string(),
        name: z.string(),
        email: z.email(),
    }),
    status: z.string(),
    totalAmount: z.number(),
    dueDate: z.date(),
    createdAt: z.date(),
})

export const columns: ColumnDef<z.infer<typeof schema>>[] = [
    {
        id: "drag",
        header: () => null,
        cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'invoiceNumber',
        header: 'Invoice #',
    },
    {
        accessorKey: 'recipient.name',
        header: 'Recipient',
        cell: ({ row }) => row.original.recipient.name || row.original.recipient.email,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
            const status = getValue() as string;
            return (
                <span className={`px-2 py-1 rounded text-xs ${status === 'paid' ? 'bg-green-100 text-green-800' :
                    status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                    }`}>
                    {status}
                </span>
            );
        },
    },
    {
        accessorKey: 'totalAmount',
        header: 'Amount',
        cell: ({ row }) => `${row.original.totalAmount}`,
    },
    {
        accessorKey: 'dueDate',
        header: 'Due Date',
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
    },
    {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            <button
                className="px-2 py-1 bg-red-600 text-white rounded text-xs"
            >
                Delete
            </button>
        ),
    },
]