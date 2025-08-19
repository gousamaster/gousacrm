"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
    createServicioComplementario,
    updateServicioComplementario,
    getTiposServicio,
    getClientesForSelect,
    getUsuarios,
} from "@/actions/servicios-complementarios"
import type { ServicioComplementario, CreateServicioComplementarioData, TipoServicio } from "@/types/servicio-complementario"

// Schema de validación
const servicioComplementarioSchema = z.object({
    clienteId: z.number().min(1, "Debe seleccionar un cliente"),
    usuarioResponsableId: z.string().optional(),
    tipoServicioId: z.number().min(1, "Debe seleccionar un tipo de servicio"),
    descripcion: z.string().optional(),
    fechaInicioServicio: z.string().optional(),
    fechaFinServicio: z.string().optional(),
})

interface ServicioComplementarioFormProps {
    servicio?: ServicioComplementario
    onSuccess: () => void
    onCancel: () => void
}

export function ServicioComplementarioForm({ servicio, onSuccess, onCancel }: ServicioComplementarioFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Estados para los catálogos
    const [tiposServicio, setTiposServicio] = useState<TipoServicio[]>([])
    const [clientes, setClientes] = useState<any[]>([])
    const [usuarios, setUsuarios] = useState<any[]>([])

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CreateServicioComplementarioData>({
        resolver: zodResolver(servicioComplementarioSchema),
        defaultValues: servicio
            ? {
                clienteId: servicio.clienteId,
                usuarioResponsableId: servicio.usuarioResponsableId || "",
                tipoServicioId: servicio.tipoServicioId,
                descripcion: servicio.descripcion || "",
                fechaInicioServicio: servicio.fechaInicioServicio || "",
                fechaFinServicio: servicio.fechaFinServicio || "",
            }
            : {
                clienteId: 0,
                usuarioResponsableId: "",
                tipoServicioId: 0,
                descripcion: "",
                fechaInicioServicio: "",
                fechaFinServicio: "",
            },
    })

    const watchedValues = watch()

    // Cargar catálogos al montar el componente
    useEffect(() => {
        const loadCatalogs = async () => {
            try {
                const [tiposRes, clientesRes, usuariosRes] = await Promise.all([
                    getTiposServicio(),
                    getClientesForSelect(),
                    getUsuarios(),
                ])

                if (tiposRes.success) setTiposServicio(tiposRes.data || [])
                if (clientesRes.success) setClientes(clientesRes.data || [])
                if (usuariosRes.success) setUsuarios(usuariosRes.data || [])
            } catch (error) {
                console.error("Error loading catalogs:", error)
            }
        }

        loadCatalogs()
    }, [])

    const onSubmit = async (data: CreateServicioComplementarioData) => {
        setIsLoading(true)
        setError(null)

        try {
            // Limpiar campos vacíos
            const cleanedData = Object.fromEntries(
                Object.entries(data).filter(([_, value]) => value !== "" && value !== 0),
            ) as CreateServicioComplementarioData

            let result
            if (servicio) {
                result = await updateServicioComplementario({ id: servicio.id, ...cleanedData })
            } else {
                result = await createServicioComplementario(cleanedData)
            }

            if (result.success) {
                onSuccess()
            } else {
                setError(result.error || "Error al procesar la solicitud")
            }
        } catch (error) {
            setError("Error inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-h-[80vh] overflow-y-auto p-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Información Básica del Servicio */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Información del Servicio</h3>

                    <div className="flex flex-col gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="clienteId">Cliente *</Label>
                            <Select
                                value={watchedValues.clienteId?.toString() || "0"}
                                onValueChange={(value) => setValue("clienteId", Number.parseInt(value))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccionar cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clientes.map((cliente) => (
                                        <SelectItem key={cliente.id} value={cliente.id.toString()}>
                                            {cliente.nombres} {cliente.apellidos}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.clienteId && <p className="text-sm text-red-500">{errors.clienteId.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="usuarioResponsableId">Usuario Responsable</Label>
                            <Select
                                value={watchedValues.usuarioResponsableId || "0"}
                                onValueChange={(value) => setValue("usuarioResponsableId", value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccionar usuario responsable" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Sin asignar</SelectItem>
                                    {usuarios.map((usuario) => (
                                        <SelectItem key={usuario.id} value={usuario.id.toString()}>
                                            {usuario.nombreCompleto} ({usuario.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tipoServicioId">Tipo de Servicio *</Label>
                            <Select
                                value={watchedValues.tipoServicioId?.toString() || "0"}
                                onValueChange={(value) => setValue("tipoServicioId", Number.parseInt(value))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccionar tipo de servicio" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tiposServicio.map((tipo) => (
                                        <SelectItem key={tipo.id} value={tipo.id.toString()}>
                                            {tipo.nombreServicio}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.tipoServicioId && <p className="text-sm text-red-500">{errors.tipoServicioId.message}</p>}
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Descripción del Servicio */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Detalles del Servicio</h3>
                    <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea
                            id="descripcion"
                            {...register("descripcion")}
                            placeholder="Describe los detalles específicos del servicio..."
                            rows={4}
                        />
                    </div>
                </div>

                <Separator />

                {/* Fechas del Servicio */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Fechas del Servicio</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fechaInicioServicio">Fecha de Inicio</Label>
                            <Input id="fechaInicioServicio" type="date" {...register("fechaInicioServicio")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fechaFinServicio">Fecha de Fin</Label>
                            <Input id="fechaFinServicio" type="date" {...register("fechaFinServicio")} />
                            <p className="text-xs text-muted-foreground">Dejar vacío si el servicio es indefinido</p>
                        </div>
                    </div>
                </div>

                {/* Error message */}
                {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</div>}

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Guardando..." : servicio ? "Actualizar Servicio" : "Crear Servicio"}
                    </Button>
                </div>
            </form>
        </div>
    )
}