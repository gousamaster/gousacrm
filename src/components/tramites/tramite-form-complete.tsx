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
    createTramite,
    updateTramite,
    getTiposTramite,
    getEstadosProceso,
    getEstadosPago,
    getClientesForSelect,
    getUsuariosForSelect,
} from "@/actions/tramites"
import type { Tramite, CreateTramiteData, TipoTramite, EstadoProceso, EstadoPago } from "@/types/tramite"

// Schema de validación
const tramiteSchema = z.object({
    clienteId: z.number().min(1, "Debe seleccionar un cliente"),
    usuarioAsignadoId: z.string().optional(),
    tipoTramiteId: z.number().min(1, "Debe seleccionar un tipo de trámite"),
    estadoProcesoId: z.number().min(1, "Debe seleccionar un estado de proceso"),
    estadoPagoId: z.number().min(1, "Debe seleccionar un estado de pago"),
    codigoConfirmacionDs160: z.string().optional(),
    codigoSeguimientoCourier: z.string().optional(),
    visaNumero: z.string().optional(),
    visaFechaEmision: z.string().optional(),
    visaFechaExpiracion: z.string().optional(),
    notas: z.string().optional(),
})

interface TramiteFormProps {
    tramite?: Tramite
    onSuccess: () => void
    onCancel: () => void
}

export function TramiteFormComplete({ tramite, onSuccess, onCancel }: TramiteFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Estados para los catálogos
    const [tiposTramite, setTiposTramite] = useState<TipoTramite[]>([])
    const [estadosProceso, setEstadosProceso] = useState<EstadoProceso[]>([])
    const [estadosPago, setEstadosPago] = useState<EstadoPago[]>([])
    const [clientes, setClientes] = useState<any[]>([])
    const [usuarios, setUsuarios] = useState<any[]>([])

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CreateTramiteData>({
        resolver: zodResolver(tramiteSchema),
        defaultValues: tramite
            ? {
                clienteId: tramite.clienteId,
                usuarioAsignadoId: tramite.usuarioAsignadoId || "",
                tipoTramiteId: tramite.tipoTramiteId,
                estadoProcesoId: tramite.estadoProcesoId,
                estadoPagoId: tramite.estadoPagoId,
                codigoConfirmacionDs160: tramite.codigoConfirmacionDs160 || "",
                codigoSeguimientoCourier: tramite.codigoSeguimientoCourier || "",
                visaNumero: tramite.visaNumero || "",
                visaFechaEmision: tramite.visaFechaEmision || "",
                visaFechaExpiracion: tramite.visaFechaExpiracion || "",
                notas: tramite.notas || "",
            }
            : {
                clienteId: 0,
                usuarioAsignadoId: "",
                tipoTramiteId: 0,
                estadoProcesoId: 0,
                estadoPagoId: 0,
                codigoConfirmacionDs160: "",
                codigoSeguimientoCourier: "",
                visaNumero: "",
                visaFechaEmision: "",
                visaFechaExpiracion: "",
                notas: "",
            },
    })

    const watchedValues = watch()

    // Cargar catálogos al montar el componente
    useEffect(() => {
        const loadCatalogs = async () => {
            try {
                const [tiposRes, estadosProcesoRes, estadosPagoRes, clientesRes, usuariosRes] = await Promise.all([
                    getTiposTramite(),
                    getEstadosProceso(),
                    getEstadosPago(),
                    getClientesForSelect(),
                    getUsuariosForSelect(),
                ])

                if (tiposRes.success) setTiposTramite(tiposRes.data || [])
                if (estadosProcesoRes.success) setEstadosProceso(estadosProcesoRes.data || [])
                if (estadosPagoRes.success) setEstadosPago(estadosPagoRes.data || [])
                if (clientesRes.success) setClientes(clientesRes.data || [])
                if (usuariosRes.success) setUsuarios(usuariosRes.data || [])
            } catch (error) {
                console.error("Error loading catalogs:", error)
            }
        }

        loadCatalogs()
    }, [])

    const onSubmit = async (data: CreateTramiteData) => {
        setIsLoading(true)
        setError(null)

        try {
            // Limpiar campos vacíos
            const cleanedData = Object.fromEntries(
                Object.entries(data).filter(([_, value]) => value !== "" && value !== 0),
            ) as CreateTramiteData

            let result
            if (tramite) {
                result = await updateTramite({ id: tramite.id, ...cleanedData })
            } else {
                result = await createTramite(cleanedData)
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
                {/* Información Básica del Trámite */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Información del Trámite</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="clienteId">Cliente *</Label>
                            <Select
                                value={watchedValues.clienteId?.toString() || "0"}
                                onValueChange={(value) => setValue("clienteId", Number.parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clientes.map((cliente) => (
                                        <SelectItem key={cliente.id} value={cliente.id.toString()}>
                                            {cliente.nombres} {cliente.apellidos}
                                            {cliente.email && ` (${cliente.email})`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.clienteId && <p className="text-sm text-red-500">{errors.clienteId.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="usuarioAsignadoId">Usuario Asignado</Label>
                            <Select
                                value={watchedValues.usuarioAsignadoId || "0"}
                                onValueChange={(value) => setValue("usuarioAsignadoId", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar usuario" />
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
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tipoTramiteId">Tipo de Trámite *</Label>
                            <Select
                                value={watchedValues.tipoTramiteId?.toString() || "0"}
                                onValueChange={(value) => setValue("tipoTramiteId", Number.parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tiposTramite.map((tipo) => (
                                        <SelectItem key={tipo.id} value={tipo.id.toString()}>
                                            {tipo.nombreTipo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.tipoTramiteId && <p className="text-sm text-red-500">{errors.tipoTramiteId.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="estadoProcesoId">Estado del Proceso *</Label>
                            <Select
                                value={watchedValues.estadoProcesoId?.toString() || "0"}
                                onValueChange={(value) => setValue("estadoProcesoId", Number.parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {estadosProceso.map((estado) => (
                                        <SelectItem key={estado.id} value={estado.id.toString()}>
                                            {estado.nombreEstado}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.estadoProcesoId && <p className="text-sm text-red-500">{errors.estadoProcesoId.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="estadoPagoId">Estado de Pago *</Label>
                            <Select
                                value={watchedValues.estadoPagoId?.toString() || "0"}
                                onValueChange={(value) => setValue("estadoPagoId", Number.parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {estadosPago.map((estado) => (
                                        <SelectItem key={estado.id} value={estado.id.toString()}>
                                            {estado.nombreEstado}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.estadoPagoId && <p className="text-sm text-red-500">{errors.estadoPagoId.message}</p>}
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Códigos y Referencias */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Códigos y Referencias</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="codigoConfirmacionDs160">Código DS-160</Label>
                            <Input
                                id="codigoConfirmacionDs160"
                                {...register("codigoConfirmacionDs160")}
                                placeholder="AA00XXXX123456"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="codigoSeguimientoCourier">Código Courier</Label>
                            <Input id="codigoSeguimientoCourier" {...register("codigoSeguimientoCourier")} placeholder="1234567890" />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Información de Visa */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Información de Visa</h3>

                    <div className="space-y-2">
                        <Label htmlFor="visaNumero">Número de Visa</Label>
                        <Input id="visaNumero" {...register("visaNumero")} placeholder="12345678901" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="visaFechaEmision">Fecha de Emisión</Label>
                            <Input id="visaFechaEmision" type="date" {...register("visaFechaEmision")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="visaFechaExpiracion">Fecha de Expiración</Label>
                            <Input id="visaFechaExpiracion" type="date" {...register("visaFechaExpiracion")} />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Notas */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Notas Adicionales</h3>
                    <div className="space-y-2">
                        <Label htmlFor="notas">Observaciones</Label>
                        <Textarea id="notas" {...register("notas")} placeholder="Notas adicionales sobre el trámite..." rows={4} />
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
                        {isLoading ? "Guardando..." : tramite ? "Actualizar Trámite" : "Crear Trámite"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
