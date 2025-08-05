"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DocumentoUploadForm } from "./documento-upload-form"

interface DocumentoDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
    defaultTramiteId?: number
}

export function DocumentoDrawer({ open, onOpenChange, onSuccess, defaultTramiteId }: DocumentoDrawerProps) {
    const handleSuccess = () => {
        onSuccess()
        onOpenChange(false)
    }

    const handleCancel = () => {
        onOpenChange(false)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Subir Documento</SheetTitle>
                    <SheetDescription>Sube un nuevo documento al sistema y asócialo con un trámite.</SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                    <DocumentoUploadForm onSuccess={handleSuccess} onCancel={handleCancel} defaultTramiteId={defaultTramiteId} />
                </div>
            </SheetContent>
        </Sheet>
    )
}
