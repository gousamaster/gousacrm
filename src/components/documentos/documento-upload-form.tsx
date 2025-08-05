"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, Upload, FileText } from "lucide-react"
import { uploadDocumento, getTiposDocumento } from "@/actions/documentos"
import { getTramitesForSelect } from "@/actions/tramites"
import type { DocumentoUploadFormProps } from "@/types/documento"

// Esquema de validación - removemos la validación del file del schema
const documentoSchema = z.object({
    tramiteId: z.string().min(1, "Debe seleccionar un trámite"),
    tipoDocumentoId: z.string().min(1, "Debe seleccionar un tipo de documento"),
})

type DocumentoFormData = z.infer<typeof documentoSchema>

interface TramiteOption {
    id: number
    clienteNombres: string | null
    clienteApellidos: string | null
    tipoTramite: string | null
}

export function DocumentoUploadForm({ onSuccess, onCancel, defaultTramiteId }: DocumentoUploadFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [tiposDocumento, setTiposDocumento] = useState<Array<{ id: number; nombreTipo: string }>>([])
    const [tramites, setTramites] = useState<TramiteOption[]>([])
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [fileError, setFileError] = useState<string | null>(null)

    const form = useForm<DocumentoFormData>({
        resolver: zodResolver(documentoSchema),
        defaultValues: {
            tramiteId: defaultTramiteId ? defaultTramiteId.toString() : "",
            tipoDocumentoId: "",
        },
    })

    // Cargar datos iniciales
    useEffect(() => {
        const loadData = async () => {
            try {
                const [tiposResult, tramitesResult] = await Promise.all([getTiposDocumento(), getTramitesForSelect()])

                if (tiposResult.success) {
                    setTiposDocumento(tiposResult.data || [])
                }

                if (tramitesResult.success) {
                    setTramites(tramitesResult.data || [])
                }
            } catch (error) {
                console.error("Error loading data:", error)
            }
        }

        loadData()
    }, [])

    // Validar archivo
    const validateFile = (file: File): string | null => {
        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/gif",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ]

        if (!allowedTypes.includes(file.type)) {
            return "Tipo de archivo no permitido"
        }

        if (file.size > 10 * 1024 * 1024) {
            return "El archivo debe ser menor a 10MB"
        }

        return null
    }

    const onSubmit = async (data: DocumentoFormData) => {
        try {
            setIsLoading(true)
            setFileError(null)

            // Validar que hay un archivo seleccionado
            if (!selectedFile) {
                setFileError("Debe seleccionar un archivo")
                return
            }

            // Validar el archivo
            const fileValidationError = validateFile(selectedFile)
            if (fileValidationError) {
                setFileError(fileValidationError)
                return
            }

            console.log("📤 Enviando formulario:", {
                fileName: selectedFile.name,
                tramiteId: data.tramiteId,
                tipoDocumentoId: data.tipoDocumentoId,
            })

            // Crear FormData
            const formData = new FormData()
            formData.append("file", selectedFile)
            formData.append("tramiteId", data.tramiteId)
            formData.append("tipoDocumentoId", data.tipoDocumentoId)

            // Subir documento
            const result = await uploadDocumento(formData)

            if (result.success) {
                console.log("✅ Documento subido exitosamente")
                onSuccess()
            } else {
                console.error("❌ Error al subir documento:", result.error)
                form.setError("root", {
                    message: result.error || "Error al subir el documento",
                })
            }
        } catch (error) {
            console.error("❌ Error inesperado:", error)
            form.setError("root", {
                message: "Error inesperado al subir el documento",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setFileError(null)

            // Validar el archivo inmediatamente
            const validationError = validateFile(file)
            if (validationError) {
                setFileError(validationError)
            }
        } else {
            setSelectedFile(null)
            setFileError(null)
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    const getTramiteLabel = (tramite: TramiteOption) => {
        const clienteName = `${tramite.clienteNombres || ""} ${tramite.clienteApellidos || ""}`.trim()
        const tipoTramite = tramite.tipoTramite || "Sin tipo"
        return `${clienteName} - ${tipoTramite}`
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Subir Documento
                </CardTitle>
                <CardDescription>Selecciona un archivo y completa la información para subir el documento.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Selección de archivo - Manejado manualmente */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Archivo *
                            </label>
                            <div className="space-y-2">
                                <Input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                                    onChange={handleFileChange}
                                    disabled={isLoading}
                                    className={fileError ? "border-red-500" : ""}
                                />
                                {selectedFile && !fileError && (
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                                        <FileText className="h-4 w-4 text-blue-500" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                                            <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                                        </div>
                                    </div>
                                )}
                                {fileError && <p className="text-sm font-medium text-destructive">{fileError}</p>}
                            </div>
                        </div>

                        {/* Selección de trámite */}
                        <FormField
                            control={form.control}
                            name="tramiteId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Trámite</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un trámite" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {tramites.map((tramite) => (
                                                <SelectItem key={tramite.id} value={tramite.id.toString()}>
                                                    {getTramiteLabel(tramite)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Selección de tipo de documento */}
                        <FormField
                            control={form.control}
                            name="tipoDocumentoId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Documento</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un tipo de documento" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {tiposDocumento.map((tipo) => (
                                                <SelectItem key={tipo.id} value={tipo.id.toString()}>
                                                    {tipo.nombreTipo}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Error general */}
                        {form.formState.errors.root && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{form.formState.errors.root.message}</div>
                        )}

                        {/* Botones */}
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading || !selectedFile || !!fileError}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Subiendo...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Subir Documento
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
