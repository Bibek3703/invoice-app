import { ColumnDef } from '@tanstack/react-table'
import { z } from 'zod'
import DragHandle from '../data-table/drag-handle';
import { Checkbox } from '@/components/ui/checkbox';
import { Company } from '@/db/schema';

export const contactSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.email(),
    phone: z.string(),
    mobilePhone: z.string(),
    contactType: z.string(),
    isRegisteredUser: z.boolean(),
    company: z.custom<Company>(),
    createdAt: z.date(),
})

export const contactColumns: ColumnDef<z.infer<typeof contactSchema>>[] = [
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
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'company.name',
        header: 'Company',
        cell: ({ row }) => row.original.company.name || null,
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