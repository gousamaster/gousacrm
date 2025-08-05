"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Eye, Trash2 } from "lucide-react"
import { TramiteFormComplete } from "./tramite-form-complete"
import { DocumentoDrawer } from "../documentos/documento-drawer"
import { getDocumentosByTramite, deleteDocumento, getDocumentoUrl } from "@/actions/documentos"
import type { Tramite } from "@/types/tramite"
import type { Documento } from "@/types/documento"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface TramiteDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tramite?: Tramite
    onSuccess: () => void
}

export function TramiteDrawer({ open, onOpenChange, tramite, onSuccess }: TramiteDrawerProps) {
    const [documentos, setDocumentos] = useState<Documento[]>([])
    const [loadingDocumentos, setLoadingDocumentos] = useState(false)
    const [documentoDrawerOpen, setDocumentoDrawerOpen] = useState(false)

    // Cargar documentos del trámite
    const loadDocumentos = async () => {
        if (!tramite?.id) return

        setLoadingDocumentos(true)
        try {
            const result = await getDocumentosByTramite(tramite.id)
            if (result.success) {
                setDocumentos(result.data || [])
            }
        } catch (error) {
            console.error("Error loading documentos:", error)
        } finally {
            setLoadingDocumentos(false)
        }
    }

    // Cargar documentos cuando se abre el drawer y hay un trámite
    useEffect(() => {
        if (open && tramite?.id) {
            loadDocumentos()
        }
    }, [open, tramite?.id])

    const handleSuccess = () => {
        onSuccess()
        onOpenChange(false)
    }

    const handleCancel = () => {
        onOpenChange(false)
    }

    const handleDocumentoSuccess = () => {
        loadDocumentos() // Recargar documentos
    }

    const handleViewDocument = async (documento: Documento) => {
        try {
            const result = await getDocumentoUrl(documento.rutaArchivo)
            if (result.success && result.url) {
                window.open(await result.url, "_blank")
            } else {
                console.error("Error getting document URL:", result.error)
            }
        } catch (error) {
            console.error("Error opening document:", error)
        }
    }

    const handleDeleteDocument = async (documento: Documento) => {
        if (confirm(`¿Estás seguro de eliminar el documento "${documento.nombreDocumento}"?`)) {
            const result = await deleteDocumento(documento.id)
            if (result.success) {
                loadDocumentos()
            }
        }
    }

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent side="right" className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>{tramite ? "Editar Trámite" : "Nuevo Trámite"}</SheetTitle>
                        <SheetDescription>
                            {tramite
                                ? "Actualiza la información del trámite y gestiona sus documentos."
                                : "Completa los datos para crear un nuevo trámite."}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6">
                        <Tabs defaultValue="tramite" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="tramite">Información del Trámite</TabsTrigger>
                                <TabsTrigger value="documentos" disabled={!tramite}>
                                    Documentos ({documentos.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="tramite" className="mt-6">
                                <TramiteFormComplete tramite={tramite} onSuccess={handleSuccess} onCancel={handleCancel} />
                            </TabsContent>

                            <TabsContent value="documentos" className="mt-6">
                                <div className="space-y-4 p-4">
                                    {/* Header de documentos */}
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold">Documentos del Trámite</h3>
                                            <p className="text-sm text-muted-foreground">Gestiona los documentos asociados a este trámite</p>
                                        </div>
                                        <Button onClick={() => setDocumentoDrawerOpen(true)} size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Subir Documento
                                        </Button>
                                    </div>

                                    {/* Lista de documentos */}
                                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                                        {loadingDocumentos ? (
                                            <div className="text-center py-8 text-muted-foreground">Cargando documentos...</div>
                                        ) : documentos.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                                <p>No hay documentos asociados a este trámite</p>
                                                <Button variant="outline" onClick={() => setDocumentoDrawerOpen(true)} className="mt-4">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Subir primer documento
                                                </Button>
                                            </div>
                                        ) : (
                                            documentos.map((documento) => (
                                                <div key={documento.id} className="border rounded-lg p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start space-x-3 flex-1">
                                                            <FileText className="h-8 w-8 text-blue-500 mt-1" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <h4 className="font-medium truncate">{documento.nombreDocumento}</h4>
                                                                </div>
                                                                <div className="text-sm text-muted-foreground space-y-1">
                                                                    <p>Tipo: {documento.tipoDocumento?.nombreTipo}</p>
                                                                    <p>
                                                                        Subido:{" "}
                                                                        {format(new Date(documento.fechaCreacion), "dd/MM/yyyy HH:mm", { locale: es })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-1 ml-4">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleViewDocument(documento)}
                                                                title="Ver documento"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteDocument(documento)}
                                                                title="Eliminar documento"
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Drawer para subir documentos */}
            <DocumentoDrawer
                open={documentoDrawerOpen}
                onOpenChange={setDocumentoDrawerOpen}
                onSuccess={handleDocumentoSuccess}
                defaultTramiteId={tramite?.id}
            />
        </>
    )
}
