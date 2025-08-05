"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Search, FileText, Eye, Trash2, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentoDrawer } from "./documento-drawer"
import { DocumentosSkeleton } from "./documentos-skeleton"
import { getDocumentos, deleteDocumento, getDocumentosStats, getDocumentoUrl } from "@/actions/documentos"
import type { Documento } from "@/types/documento"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function DocumentosPage() {
    const [documentos, setDocumentos] = useState<Documento[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [documentoToDelete, setDocumentoToDelete] = useState<Documento | null>(null)
    const [stats, setStats] = useState<any>(null)

    // Cargar documentos y estadísticas
    const loadData = async () => {
        setLoading(true)
        try {
            const [documentosResult, statsResult] = await Promise.all([getDocumentos(), getDocumentosStats()])

            if (documentosResult.success) {
                setDocumentos(documentosResult.data || [])
            }

            if (statsResult.success) {
                setStats(statsResult.data)
            }
        } catch (error) {
            console.error("❌ Error loading data:", error)
        } finally {
            setLoading(false)
        }
    }

    // Cargar datos al montar el componente
    useEffect(() => {
        loadData()
    }, [])

    // Filtrar documentos
    const filteredDocumentos = useMemo(() => {
        let filtered = documentos

        // Filtro por término de búsqueda
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase().trim()
            filtered = filtered.filter(
                (documento) =>
                    documento.nombreDocumento.toLowerCase().includes(search) ||
                    documento.tramite?.cliente?.nombres?.toLowerCase().includes(search) ||
                    documento.tramite?.cliente?.apellidos?.toLowerCase().includes(search) ||
                    documento.tipoDocumento?.nombreTipo?.toLowerCase().includes(search),
            )
        }

        return filtered.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
    }, [documentos, searchTerm])

    // Manejar búsqueda
    const handleSearch = (value: string) => {
        setSearchTerm(value)
    }

    // Manejar creación de nuevo documento
    const handleNewDocumento = () => {
        setDrawerOpen(true)
    }

    // Manejar visualización de documento
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

    // Manejar eliminación de documento
    const handleDeleteDocumento = (documento: Documento) => {
        setDocumentoToDelete(documento)
        setDeleteDialogOpen(true)
    }

    // Confirmar eliminación
    const confirmDelete = async () => {
        if (documentoToDelete) {
            const result = await deleteDocumento(documentoToDelete.id)
            if (result.success) {
                await loadData()
            }
            setDeleteDialogOpen(false)
            setDocumentoToDelete(null)
        }
    }

    // Manejar éxito en formulario
    const handleFormSuccess = async () => {
        await loadData()
    }

    // Obtener icono según extensión de archivo
    const getFileIcon = (nombreArchivo: string) => {
        const extension = nombreArchivo.split(".").pop()?.toLowerCase()
        switch (extension) {
            case "pdf":
                return "📄"
            case "jpg":
            case "jpeg":
            case "png":
            case "gif":
                return "🖼️"
            case "doc":
            case "docx":
                return "📝"
            case "xls":
            case "xlsx":
                return "📊"
            default:
                return "📎"
        }
    }

    // Mostrar skeleton mientras carga
    if (loading) {
        return <DocumentosSkeleton />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Documentos</h1>
                    <p className="text-muted-foreground">Gestiona todos los documentos del sistema</p>
                </div>
                <Button onClick={handleNewDocumento}>
                    <Plus className="mr-2 h-4 w-4" />
                    Subir Documento
                </Button>
            </div>

            {/* Estadísticas */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalDocumentos}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.documentosEsteMes || 0}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filtros y búsqueda */}
            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Buscar por nombre, cliente, tipo..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {searchTerm && (
                    <Button variant="outline" onClick={() => handleSearch("")} size="sm">
                        Limpiar
                    </Button>
                )}
            </div>

            {/* Estadísticas de filtros */}
            <div className="flex items-center text-sm text-muted-foreground">
                <span>
                    {searchTerm
                        ? `${filteredDocumentos.length} de ${documentos.length} documentos`
                        : `${documentos.length} documentos en total`}
                </span>
            </div>

            {/* Tabla de documentos */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Archivo</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Cliente/Trámite</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="w-[70px]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredDocumentos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <div className="text-muted-foreground">
                                        {searchTerm ? (
                                            <>
                                                No se encontraron documentos que coincidan con la búsqueda.{" "}
                                                <Button variant="link" onClick={() => handleSearch("")} className="p-0">
                                                    Limpiar búsqueda
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                No hay documentos registrados.{" "}
                                                <Button variant="link" onClick={handleNewDocumento} className="p-0">
                                                    Subir el primero
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredDocumentos.map((documento) => (
                                <TableRow key={documento.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg">{getFileIcon(documento.nombreDocumento)}</span>
                                            <div>
                                                <div className="font-medium truncate max-w-[200px]" title={documento.nombreDocumento}>
                                                    {documento.nombreDocumento}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{documento.tipoDocumento?.nombreTipo || "-"}</TableCell>
                                    <TableCell>
                                        <div>
                                            {documento.tramite ? (
                                                <div>
                                                    <div className="font-medium">
                                                        {documento.tramite.cliente?.nombres} {documento.tramite.cliente?.apellidos}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {documento.tramite.tipoTramite?.nombreTipo}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">Sin asociar</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div>{format(new Date(documento.fechaCreacion), "dd/MM/yyyy", { locale: es })}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {format(new Date(documento.fechaCreacion), "HH:mm", { locale: es })}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleViewDocument(documento)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Ver
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteDocumento(documento)} className="text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Drawer para subir documentos */}
            <DocumentoDrawer open={drawerOpen} onOpenChange={setDrawerOpen} onSuccess={handleFormSuccess} />

            {/* Dialog de confirmación para eliminar */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el documento{" "}
                            <strong>"{documentoToDelete?.nombreDocumento}"</strong> del sistema y del almacenamiento.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
