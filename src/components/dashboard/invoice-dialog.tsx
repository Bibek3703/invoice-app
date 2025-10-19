import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '../ui/button'
import { IconPlus } from '@tabler/icons-react'
import { InvoiceForm, InvoiceFormValues } from './forms/invoice-form'
import { ScrollArea } from '../ui/scroll-area'
import { useIsMobile } from '@/hooks/use-mobile'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '../ui/drawer'
import InvoiceViewer from '../invoice-viewer'
import { PDFViewer } from '@react-pdf/renderer'
import InvoicePDF from '../invoice-pdf'
import { Eye, X } from 'lucide-react'
import { DialogClose } from '@radix-ui/react-dialog'

interface InvoiceDialogPropsType {
    companyId: string
    direction?: "outgoing" | "incoming"
}

function InvoiceDialog({ companyId, direction = "outgoing" }: InvoiceDialogPropsType) {
    const [open, setOpen] = React.useState(false)
    const [previewOpen, setPreviewOpen] = React.useState(false)
    const isMobile = useIsMobile()
    const [invoiceValues, setInvoiceValues] = React.useState<InvoiceFormValues | null>(null)


    if (isMobile) {
        return <>
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button>
                        <IconPlus />
                        <span className="hidden lg:inline">Create Invoice</span>
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader className="border-b border-border">
                        <DrawerTitle>Create New Invoice</DrawerTitle>
                        <DrawerDescription>
                            Fill in the details below to create a new invoice for your client.
                        </DrawerDescription>
                        <div className='w-full flex'>
                            <Button className='ml-auto' onClick={() => setPreviewOpen(true)}>
                                <Eye />
                            </Button>
                        </div>
                    </DrawerHeader>
                    <div className='flex-1 flex-grow flex flex-col w-full h-full overflow-hidden bg-accent'>
                        <div className='w-full h-full max-h-full overflow-y-auto'>
                            <div className="flex h-auto flex-col p-4 gap-6">
                                <InvoiceForm
                                    companyId={companyId}
                                    direction={direction}
                                    onUpdate={(values) => {
                                        setInvoiceValues(values)
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className='min-w-[calc(100%-2rem)] h-[calc(100%-2rem)] flex flex-col p-0 overflow-hidden'>
                    <DialogHeader className='pt-5'>
                        <DialogTitle>Invoice Viewer</DialogTitle>
                        <DialogDescription>
                            View invoice and send it to your client.
                        </DialogDescription>
                    </DialogHeader>
                    <div className='flex-1 flex flex-col w-full h-full max-h-full overflow-y-auto bg-muted'>
                        {/* TODO: update responsive for mobile */}
                        {invoiceValues &&
                            <InvoiceViewer invoiceData={invoiceValues} />
                        }
                    </div>
                </DialogContent>
            </Dialog>
        </>
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <IconPlus />
                    <span className="hidden lg:inline">Create Invoice</span>
                </Button>
            </DialogTrigger>
            <DialogContent className='lg:min-w-[calc(100%-2rem)] lg:h-[calc(100%-2rem)] flex flex-col'>
                <DialogHeader>
                    <DialogTitle>New Invoice</DialogTitle>
                    <DialogDescription>
                        Create a new invoice and send it to your client.
                    </DialogDescription>
                </DialogHeader>
                <div className='flex-1 flex flex-col lg:flex-row w-full lg:max-h-full lg:overflow-hidden'>
                    <ScrollArea className='w-full pr-6 py-3'>
                        <InvoiceForm
                            companyId={companyId}
                            direction={direction}
                            onUpdate={(values) => {
                                setInvoiceValues(values)
                            }}
                        />
                    </ScrollArea>
                    <div className='w-full h-full bg-muted overflow-y-auto box-border'>
                        {invoiceValues &&
                            <InvoiceViewer invoiceData={invoiceValues} />
                        }
                        {/* {invoiceValues && <PDFViewer className='w-full h-full'>
                            <InvoicePDF invoiceData={invoiceValues} />
                        </PDFViewer>} */}

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default InvoiceDialog
