"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const invoiceItemSchema = z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.string().min(1, "Quantity is required"),
    unitType: z.string().min(1, "Unit type is required"),
    unitPrice: z.string().min(1, "Unit price is required"),
    taxRate: z.string().min(0, "Tax rate is required"),
})

const invoiceFormSchema = z.object({
    recipientId: z.string().min(1, "Recipient is required"),
    invoiceNumber: z.string().min(1, "Invoice number is required"),
    issueDate: z.date("Issue date is required"),
    dueDate: z.date("Due date is required"),
    currency: z.string().min(1, "Currency is required"),
    items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
    notes: z.string().optional(),
    terms: z.string().optional(),
})

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>

// Mock recipients data - replace with actual data from your database
const mockRecipients = [
    {
        id: "1",
        name: "Acme Corp",
        email: "contact@acme.com"
    },
    {
        id: "2",
        name: "TechStart Inc",
        email: "billing@techstart.com"
    },
    {
        id: "3",
        name: "Global Solutions",
        email: "accounts@global.com"
    },
]

const currencies = ["USD", "EUR", "GBP", "CAD", "AUD"]
const unitTypes = ["hours", "pieces", "kg", "litres", "days", "units"]

export function InvoiceForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<InvoiceFormValues>({
        resolver: zodResolver(invoiceFormSchema),
        defaultValues: {
            recipientId: "",
            invoiceNumber: `INV-${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}-0001`,
            issueDate: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            currency: "USD",
            items: [
                {
                    description: "",
                    quantity: "",
                    unitType: "hours",
                    unitPrice: "",
                    taxRate: "0.10",
                },
            ],
            notes: "",
            terms: "",
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    const calculateItemTotal = (index: number) => {
        const item = form.watch(`items.${index}`)
        const quantity = Number.parseFloat(item.quantity) || 0
        const unitPrice = Number.parseFloat(item.unitPrice) || 0
        const taxRate = Number.parseFloat(item.taxRate) || 0

        const subtotal = quantity * unitPrice
        const taxAmount = subtotal * taxRate
        const total = subtotal + taxAmount

        return { subtotal, taxAmount, total }
    }

    const calculateInvoiceTotals = () => {
        const items = form.watch("items")
        let subtotal = 0
        let taxTotal = 0

        items.forEach((item, index) => {
            const { subtotal: itemSubtotal, taxAmount } = calculateItemTotal(index)
            subtotal += itemSubtotal
            taxTotal += taxAmount
        })

        const total = subtotal + taxTotal

        return { subtotal, taxTotal, total }
    }

    const totals = calculateInvoiceTotals()

    async function onSubmit(data: InvoiceFormValues) {
        setIsSubmitting(true)
        try {
            // TODO: Implement API call to create invoice
            console.log("[v0] Invoice data:", data)
            console.log("[v0] Calculated totals:", totals)

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            alert("Invoice created successfully!")
            form.reset()
        } catch (error) {
            console.error("[v0] Error creating invoice:", error)
            alert("Failed to create invoice. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 h-auto">

                <Label className="font-bold">Invoice Details</Label>

                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="invoiceNumber"
                        render={({ field }) => (
                            <FormItem className="h-full gap-2 flex flex-col px-1">
                                <FormLabel>Invoice Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="INV-001" {...field} readOnly />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="recipientId"
                        render={({ field }) => (
                            <FormItem className="gap-2 h-full flex flex-col">
                                <FormLabel>Recipient</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select recipient" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {mockRecipients.map((recipient) => (
                                            <SelectItem key={recipient.id} value={recipient.id}>
                                                {recipient.name} ({recipient.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                        control={form.control}
                        name="issueDate"
                        render={({ field }) => (
                            <FormItem className="gap-2 h-full flex flex-col">
                                <FormLabel>Issue Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !field.value && "text-muted-foreground",
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? format(field.value, "PPP") : "Pick a date"}
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                            <FormItem className="gap-2 h-full flex flex-col">
                                <FormLabel>Due Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !field.value && "text-muted-foreground",
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? format(field.value, "PPP") : "Pick a date"}
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                            <FormItem className="gap-2 h-full flex flex-col">
                                <FormLabel>Currency</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {currencies.map((currency) => (
                                            <SelectItem key={currency} value={currency}>
                                                {currency}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Separator />
                <div className="flex items-center justify-between">
                    <Label>Line Items</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            append({
                                description: "",
                                quantity: "",
                                unitType: "hours",
                                unitPrice: "",
                                taxRate: "0.10",
                            })
                        }
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                    </Button>
                </div>
                {fields.map((field, index) => {
                    const itemTotal = calculateItemTotal(index)
                    return (
                        <div key={field.id} className="space-y-4 rounded-lg border border-border p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-4">
                                    <FormField
                                        control={form.control}

                                        name={`items.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem className="gap-2 h-full flex flex-col">
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Service or product description" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid gap-4 md:grid-cols-4">
                                        <FormField
                                            control={form.control}

                                            name={`items.${index}.quantity`}
                                            render={({ field }) => (
                                                <FormItem className="gap-2 h-full flex flex-col">
                                                    <FormLabel>Quantity</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="0.01" placeholder="1" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}

                                            name={`items.${index}.unitType`}
                                            render={({ field }) => (
                                                <FormItem className="gap-2 h-full flex flex-col">
                                                    <FormLabel>Unit</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Unit" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {unitTypes.map((unit) => (
                                                                <SelectItem key={unit} value={unit}>
                                                                    {unit}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}

                                            name={`items.${index}.unitPrice`}
                                            render={({ field }) => (
                                                <FormItem className="gap-2 h-full flex flex-col">
                                                    <FormLabel>Unit Price</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}

                                            name={`items.${index}.taxRate`}
                                            render={({ field }) => (
                                                <FormItem className="gap-2 h-full flex flex-col">
                                                    <FormLabel>Tax Rate</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="0.01" placeholder="0.10" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="space-y-1">
                                            <div className="text-muted-foreground">Subtotal: ${itemTotal.subtotal.toFixed(2)}</div>
                                            <div className="text-muted-foreground">Tax: ${itemTotal.taxAmount.toFixed(2)}</div>
                                            <div className="font-medium">Total: ${itemTotal.total.toFixed(2)}</div>
                                        </div>
                                    </div>
                                </div>

                                {fields.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => remove(index)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )
                })}

                <div className="flex justify-end">
                    <div className="w-full lg:max-w-xs space-y-2 rounded-lg border border-border bg-muted/50 p-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax Total:</span>
                            <span className="font-medium">${totals.taxTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                            <span>Total:</span>
                            <span>${totals.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <Separator />

                <Label>Additional Information</Label>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem className="gap-2 h-full flex flex-col px-1">
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Add any additional notes or comments..." className="min-h-24" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                        <FormItem className="gap-2 h-full flex flex-col px-1">
                            <FormLabel>Terms & Conditions</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Payment terms, late fees, etc..." className="min-h-24" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Separator />

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isSubmitting}>
                        Reset
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Invoice"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
