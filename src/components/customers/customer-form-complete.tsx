"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { createCustomer, updateCustomer } from "@/actions/customers"
import type { Customer, CreateCustomerData } from "@/types/customer"

// Schema de validación completo
const customerSchema = z.object({
    nombres: z.string().min(1, "Los nombres son requeridos"),
    apellidos: z.string().min(1, "Los apellidos son requeridos"),
    fechaNacimiento: z.string().optional(),
    lugarNacimiento: z.string().optional(),
    numeroCi: z.string().optional(),
    numeroPasaporte: z.string().optional(),
    pasaporteFechaEmision: z.string().optional(),
    pasaporteFechaExpiracion: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    telefonoCelular: z.string().optional(),
    direccionDomicilio: z.string().optional(),
    estadoCivil: z.string().optional(),
    profesion: z.string().optional(),
    conyugeNombreCompleto: z.string().optional(),
    conyugeFechaNacimiento: z.string().optional(),
    conyugeLugarNacimiento: z.string().optional(),
    matrimonioFechaInicio: z.string().optional(),
    matrimonioFechaFin: z.string().optional(),
})

interface CustomerFormProps {
    customer?: Customer
    onSuccess: () => void
    onCancel: () => void
}

export function CustomerFormComplete({ customer, onSuccess, onCancel }: CustomerFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CreateCustomerData>({
        resolver: zodResolver(customerSchema),
        defaultValues: customer
            ? {
                nombres: customer.nombres,
                apellidos: customer.apellidos,
                fechaNacimiento: customer.fechaNacimiento || "",
                lugarNacimiento: customer.lugarNacimiento || "",
                numeroCi: customer.numeroCi || "",
                numeroPasaporte: customer.numeroPasaporte || "",
                pasaporteFechaEmision: customer.pasaporteFechaEmision || "",
                pasaporteFechaExpiracion: customer.pasaporteFechaExpiracion || "",
                email: customer.email || "",
                telefonoCelular: customer.telefonoCelular || "",
                direccionDomicilio: customer.direccionDomicilio || "",
                estadoCivil: customer.estadoCivil || "",
                profesion: customer.profesion || "",
                conyugeNombreCompleto: customer.conyugeNombreCompleto || "",
                conyugeFechaNacimiento: customer.conyugeFechaNacimiento || "",
                conyugeLugarNacimiento: customer.conyugeLugarNacimiento || "",
                matrimonioFechaInicio: customer.matrimonioFechaInicio || "",
                matrimonioFechaFin: customer.matrimonioFechaFin || "",
            }
            : {
                nombres: "",
                apellidos: "",
                fechaNacimiento: "",
                lugarNacimiento: "",
                numeroCi: "",
                numeroPasaporte: "",
                pasaporteFechaEmision: "",
                pasaporteFechaExpiracion: "",
                email: "",
                telefonoCelular: "",
                direccionDomicilio: "",
                estadoCivil: "",
                profesion: "",
                conyugeNombreCompleto: "",
                conyugeFechaNacimiento: "",
                conyugeLugarNacimiento: "",
                matrimonioFechaInicio: "",
                matrimonioFechaFin: "",
            },
    })

    const estadoCivilValue = watch("estadoCivil")

    const onSubmit = async (data: CreateCustomerData) => {
        setIsLoading(true)
        setError(null)

        try {
            // Limpiar campos vacíos
            const cleanedData = Object.fromEntries(
                Object.entries(data).filter(([_, value]) => value !== ""),
            ) as CreateCustomerData

            let result
            if (customer) {
                result = await updateCustomer({ id: customer.id, ...cleanedData })
            } else {
                result = await createCustomer(cleanedData)
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
                {/* Información Personal Básica */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Información Personal</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nombres">Nombres *</Label>
                            <Input id="nombres" {...register("nombres")} placeholder="Juan Carlos" />
                            {errors.nombres && <p className="text-sm text-red-500">{errors.nombres.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="apellidos">Apellidos *</Label>
                            <Input id="apellidos" {...register("apellidos")} placeholder="Pérez González" />
                            {errors.apellidos && <p className="text-sm text-red-500">{errors.apellidos.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                            <Input id="fechaNacimiento" type="date" {...register("fechaNacimiento")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lugarNacimiento">Lugar de Nacimiento</Label>
                            <Input id="lugarNacimiento" {...register("lugarNacimiento")} placeholder="La Paz, Bolivia" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="numeroCi">Número de CI</Label>
                            <Input id="numeroCi" {...register("numeroCi")} placeholder="12345678" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="estadoCivil">Estado Civil</Label>
                            <Select value={estadoCivilValue} onValueChange={(value) => setValue("estadoCivil", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar estado civil" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Soltero/a">Soltero/a</SelectItem>
                                    <SelectItem value="Casado/a">Casado/a</SelectItem>
                                    <SelectItem value="Divorciado/a">Divorciado/a</SelectItem>
                                    <SelectItem value="Viudo/a">Viudo/a</SelectItem>
                                    <SelectItem value="Unión Libre">Unión Libre</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="profesion">Profesión</Label>
                        <Input id="profesion" {...register("profesion")} placeholder="Ingeniero de Sistemas" />
                    </div>
                </div>

                <Separator />

                {/* Información de Contacto */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Información de Contacto</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...register("email")} placeholder="juan.perez@email.com" />
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="telefonoCelular">Teléfono Celular *</Label>
                            <Input id="telefonoCelular" {...register("telefonoCelular")} placeholder="+591 70123456" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="direccionDomicilio">Dirección de Domicilio</Label>
                        <Textarea
                            id="direccionDomicilio"
                            {...register("direccionDomicilio")}
                            placeholder="Av. Ejemplo #123, Zona Central, La Paz"
                            rows={2}
                        />
                    </div>
                </div>

                <Separator />

                {/* Información de Pasaporte */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Información de Pasaporte</h3>

                    <div className="space-y-2">
                        <Label htmlFor="numeroPasaporte">Número de Pasaporte</Label>
                        <Input id="numeroPasaporte" {...register("numeroPasaporte")} placeholder="A12345678" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="pasaporteFechaEmision">Fecha de Emisión</Label>
                            <Input id="pasaporteFechaEmision" type="date" {...register("pasaporteFechaEmision")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pasaporteFechaExpiracion">Fecha de Expiración</Label>
                            <Input id="pasaporteFechaExpiracion" type="date" {...register("pasaporteFechaExpiracion")} />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Información del Cónyuge */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Información del Cónyuge (Opcional)</h3>

                    <div className="space-y-2">
                        <Label htmlFor="conyugeNombreCompleto">Nombre Completo del Cónyuge</Label>
                        <Input
                            id="conyugeNombreCompleto"
                            {...register("conyugeNombreCompleto")}
                            placeholder="María Elena Rodríguez"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="conyugeFechaNacimiento">Fecha de Nacimiento</Label>
                            <Input id="conyugeFechaNacimiento" type="date" {...register("conyugeFechaNacimiento")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="conyugeLugarNacimiento">Lugar de Nacimiento</Label>
                            <Input
                                id="conyugeLugarNacimiento"
                                {...register("conyugeLugarNacimiento")}
                                placeholder="Cochabamba, Bolivia"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="matrimonioFechaInicio">Fecha de Matrimonio</Label>
                            <Input id="matrimonioFechaInicio" type="date" {...register("matrimonioFechaInicio")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="matrimonioFechaFin">Fecha de Fin de Matrimonio</Label>
                            <Input id="matrimonioFechaFin" type="date" {...register("matrimonioFechaFin")} />
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
                        {isLoading ? "Guardando..." : customer ? "Actualizar Cliente" : "Crear Cliente"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
