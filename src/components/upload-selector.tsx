import { PlusCircle } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import React from "react"
import { FileUpload } from "./ui/file-upload"
import { Button } from "./ui/button"
import CameraView from "./camera-view"

export default function UploadSelector() {
    const [fileUploadOpen, setFileUploadOpen] = React.useState(false)
    const [takePhotoOpen, setTakePhotoOpen] = React.useState(false)
    const [open, setOpen] = React.useState(false)
    const [files, setFiles] = React.useState<File[]>([]);

    const handleFileUpload = (files: File[]) => {
        if (files.length === 0) {
            setFiles(files);
            console.log(files);
        }
    };

    return (
        <>
            <div className="grid w-full gap-4">
                <InputGroup>
                    <InputGroupInput placeholder="Upload..." readOnly onClick={() => setOpen(!open)} />
                    <InputGroupAddon align="inline-end">
                        <DropdownMenu open={open} onOpenChange={setOpen}>
                            <DropdownMenuTrigger asChild>
                                <InputGroupButton
                                    variant="ghost"
                                    aria-label="More"
                                    size="icon-xs"
                                >
                                    <PlusCircle />
                                </InputGroupButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => setTakePhotoOpen(true)}
                                >
                                    Take photo
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setFileUploadOpen(true)}
                                >
                                    Add files
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </InputGroupAddon>
                </InputGroup>
            </div>
            <Dialog open={fileUploadOpen} onOpenChange={setFileUploadOpen}>
                <DialogContent className="max-h-[calc(100%-2rem)] px-0 flex flex-col">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Upload file</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here. Click save when you&apos;re
                            done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 w-full h-full max-h-full overflow-y-auto max-w-[100svw] px-4 mt-6">
                        <FileUpload onChange={handleFileUpload} multiple containerClass="pt-4 px-2" />
                    </div>
                    <DialogFooter className="p-4">
                        <Button
                            variant="destructive"
                            className=""
                            onClick={() => setFileUploadOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button>Upload</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={takePhotoOpen} onOpenChange={setTakePhotoOpen}>
                <DialogContent className="max-h-[calc(100%-2rem)] px-0 flex flex-col">
                    <DialogHeader >
                        <DialogTitle className="sr-only">Take photo</DialogTitle>
                        <DialogDescription className="sr-only">
                            Make changes to your profile here. Click save when you&apos;re
                            done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 w-full h-full max-h-full overflow-y-auto max-w-[100svw] px-4">
                        <CameraView
                            closeCamera={!takePhotoOpen}
                            onUsePhoto={(data) => {
                                console.log({ data })
                                setTakePhotoOpen(false)
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
