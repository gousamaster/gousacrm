"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TramiteFormComplete } from "./tramite-form-complete"
import type { Tramite } from "../../types/tramite"

interface TramiteDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tramite?: Tramite
    onSuccess: () => void
}

export function TramiteDrawer({ open, onOpenChange, tramite, onSuccess }: TramiteDrawerProps) {
    const handleSuccess = () => {
        onSuccess()
        onOpenChange(false)
    }

    const handleCancel = () => {
        onOpenChange(false)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange} >
            <SheetContent side="right" className="w-full sm:max-w-2xl" >
                <SheetHeader>
                    <SheetTitle>{tramite ? "Editar Trámite" : "Nuevo Trámite"} </SheetTitle>
                    <SheetDescription>
                        {tramite ? "Actualiza la información del trámite." : "Completa los datos para crear un nuevo trámite."}
                    </SheetDescription>
                </SheetHeader>
                < div className="mt-6" >
                    <TramiteFormComplete tramite={tramite} onSuccess={handleSuccess} onCancel={handleCancel} />
                </div>
            </SheetContent>
        </Sheet>
    )
}
