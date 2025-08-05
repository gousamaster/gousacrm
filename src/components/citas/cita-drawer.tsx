"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { CitaFormComplete } from "./cita-form-complete"
import type { Cita } from "@/types/cita"

interface CitaDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    cita?: Cita
    onSuccess: () => void
    defaultTramiteId?: number
    defaultFechaHora?: string
}

export function CitaDrawer({
    open,
    onOpenChange,
    cita,
    onSuccess,
    defaultTramiteId,
    defaultFechaHora,
}: CitaDrawerProps) {
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
                    <SheetTitle>{cita ? "Editar Cita" : "Nueva Cita"}</SheetTitle>
                    <SheetDescription>
                        {cita ? "Actualiza la información de la cita." : "Completa los datos para agendar una nueva cita."}
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                    <CitaFormComplete
                        cita={cita}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                        defaultTramiteId={defaultTramiteId}
                        defaultFechaHora={defaultFechaHora}
                    />
                </div>
            </SheetContent>
        </Sheet>
    )
}
