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
import { InvoiceForm } from './forms/invoice-form'
import { ScrollArea } from '../ui/scroll-area'
import { useIsMobile } from '@/hooks/use-mobile'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '../ui/drawer'

function InvoiceDialog() {
    const [open, setOpen] = React.useState(false)
    const isMobile = useIsMobile()

    if (isMobile) {
        return <Drawer open={open} onOpenChange={setOpen}>
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
                </DrawerHeader>
                <div className='flex-1 flex-grow flex flex-col w-full h-full overflow-hidden bg-accent'>
                    <div className='w-full h-full max-h-full overflow-y-auto'>
                        <div className="flex h-auto flex-col p-4 gap-6">
                            <InvoiceForm />
                            <div className='w-full min-h-[200px] bg-red-500'>
                                sdf
                            </div>
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => { }}>
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
                        <InvoiceForm />
                    </ScrollArea>
                    <div className='w-full h-full bg-muted'></div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default InvoiceDialog
