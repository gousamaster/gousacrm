"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ServicioComplementarioForm } from "./servicio-complementario-form"
import type { ServicioComplementario } from "@/types/servicio-complementario"

interface ServicioComplementarioDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    servicio?: ServicioComplementario
    onSuccess: () => void
}

export function ServicioComplementarioDrawer({ open, onOpenChange, servicio, onSuccess }: ServicioComplementarioDrawerProps) {
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
                    <SheetTitle>{servicio ? "Editar Servicio Complementario" : "Nuevo Servicio Complementario"}</SheetTitle>
                    <SheetDescription>
                        {servicio
                            ? "Actualiza la información del servicio complementario."
                            : "Completa los datos para crear un nuevo servicio complementario."}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6">
                    <ServicioComplementarioForm servicio={servicio} onSuccess={handleSuccess} onCancel={handleCancel} />
                </div>
            </SheetContent>
        </Sheet>
    )
}