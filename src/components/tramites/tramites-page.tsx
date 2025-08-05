"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Pencil, Trash2, MoreHorizontal, Search, Filter, FileText, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { TramiteDrawer } from "./tramite-drawer"
import { TramitesSkeleton } from "./tramites-skeleton"
import { StatusBadge } from "./status-badges"
import { getTramites, deleteTramite } from "@/actions/tramites"
import type { Tramite } from "@/types/tramite"

export default function TramitesPage() {
    const [tramites, setTramites] = useState<Tramite[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editingTramite, setEditingTramite] = useState<Tramite | undefined>()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [tramiteToDelete, setTramiteToDelete] = useState<Tramite | null>(null)

    // Cargar trámites
    const loadTramites = async () => {
        setLoading(true)
        try {
            const result = await getTramites()
            if (result.success) {
                setTramites(result.data || [])
                console.log("📊 Trámites cargados:", result.data?.length || 0)
            } else {
                setTramites([])
                console.error("❌ Error loading tramites:", result.error)
            }
        } catch (error) {
            console.error("❌ Error inesperado:", error)
            setTramites([])
        } finally {
            setLoading(false)
        }
    }

    // Cargar trámites al montar el componente
    useEffect(() => {
        loadTramites()
    }, [])

    // Filtrar trámites
    const filteredTramites = useMemo(() => {
        let filtered = tramites

        // Filtro por término de búsqueda
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase().trim()
            filtered = filtered.filter(
                (tramite) =>
                    tramite.cliente?.nombres?.toLowerCase().includes(search) ||
                    tramite.cliente?.apellidos?.toLowerCase().includes(search) ||
                    tramite.codigoConfirmacionDs160?.toLowerCase().includes(search) ||
                    tramite.codigoSeguimientoCourier?.toLowerCase().includes(search) ||
                    tramite.visaNumero?.toLowerCase().includes(search) ||
                    tramite.tipoTramite?.nombreTipo?.toLowerCase().includes(search),
            )
        }

        // Filtro por estado
        if (statusFilter !== "all") {
            filtered = filtered.filter((tramite) => {
                switch (statusFilter) {
                    case "proceso":
                        return tramite.estadoProceso?.nombreEstado?.toLowerCase().includes("proceso")
                    case "completado":
                        return tramite.estadoProceso?.nombreEstado?.toLowerCase().includes("completado")
                    case "pendiente":
                        return tramite.estadoProceso?.nombreEstado?.toLowerCase().includes("pendiente")
                    case "pagado":
                        return tramite.estadoPago?.nombreEstado?.toLowerCase().includes("pagado")
                    case "pago_pendiente":
                        return tramite.estadoPago?.nombreEstado?.toLowerCase().includes("pendiente")
                    default:
                        return true
                }
            })
        }

        return filtered
    }, [tramites, searchTerm, statusFilter])

    // Estadísticas
    const stats = useMemo(() => {
        const total = tramites.length
        const enProceso = tramites.filter((t) => t.estadoProceso?.nombreEstado?.toLowerCase().includes("proceso")).length
        const completados = tramites.filter((t) =>
            t.estadoProceso?.nombreEstado?.toLowerCase().includes("completado"),
        ).length
        const pendientesPago = tramites.filter((t) =>
            t.estadoPago?.nombreEstado?.toLowerCase().includes("pendiente"),
        ).length

        return { total, enProceso, completados, pendientesPago }
    }, [tramites])

    // Manejar búsqueda
    const handleSearch = (value: string) => {
        setSearchTerm(value)
    }

    // Manejar creación de nuevo trámite
    const handleNewTramite = () => {
        setEditingTramite(undefined)
        setDrawerOpen(true)
    }

    // Manejar edición de trámite
    const handleEditTramite = (tramite: Tramite) => {
        setEditingTramite(tramite)
        setDrawerOpen(true)
    }

    // Manejar eliminación de trámite
    const handleDeleteTramite = (tramite: Tramite) => {
        setTramiteToDelete(tramite)
        setDeleteDialogOpen(true)
    }

    // Confirmar eliminación
    const confirmDelete = async () => {
        if (tramiteToDelete) {
            const result = await deleteTramite(tramiteToDelete.id)
            if (result.success) {
                await loadTramites()
            }
            setDeleteDialogOpen(false)
            setTramiteToDelete(null)
        }
    }

    // Manejar éxito en formulario
    const handleFormSuccess = async () => {
        await loadTramites()
    }

    // Mostrar skeleton mientras carga
    if (loading) {
        return <TramitesSkeleton />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Trámites</h1>
                    <p className="text-muted-foreground">Gestiona los trámites de visa de tus clientes</p>
                </div>
                <Button onClick={handleNewTramite}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Trámite
                </Button>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Trámites</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.enProceso}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completados</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.completados}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pago Pendiente</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pendientesPago}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros y búsqueda */}
            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Buscar por cliente, código DS-160, courier..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="proceso">En Proceso</SelectItem>
                        <SelectItem value="completado">Completados</SelectItem>
                        <SelectItem value="pendiente">Pendientes</SelectItem>
                        <SelectItem value="pagado">Pagados</SelectItem>
                        <SelectItem value="pago_pendiente">Pago Pendiente</SelectItem>
                    </SelectContent>
                </Select>
                {(searchTerm || statusFilter !== "all") && (
                    <Button
                        variant="outline"
                        onClick={() => {
                            handleSearch("")
                            setStatusFilter("all")
                        }}
                        size="sm"
                    >
                        Limpiar
                    </Button>
                )}
            </div>

            {/* Estadísticas de filtros */}
            <div className="flex items-center text-sm text-muted-foreground">
                <span>
                    {searchTerm || statusFilter !== "all"
                        ? `${filteredTramites.length} de ${tramites.length} trámites`
                        : `${tramites.length} trámites en total`}
                </span>
            </div>

            {/* Tabla de trámites */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Tipo de Trámite</TableHead>
                            <TableHead>Estado Proceso</TableHead>
                            <TableHead>Estado Pago</TableHead>
                            <TableHead>Usuario Asignado</TableHead>
                            <TableHead>Fecha Creación</TableHead>
                            <TableHead className="w-[70px]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTramites.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <div className="text-muted-foreground">
                                        {searchTerm || statusFilter !== "all" ? (
                                            <>
                                                No se encontraron trámites que coincidan con los filtros.{" "}
                                                <Button
                                                    variant="link"
                                                    onClick={() => {
                                                        handleSearch("")
                                                        setStatusFilter("all")
                                                    }}
                                                    className="p-0"
                                                >
                                                    Limpiar filtros
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                No hay trámites registrados.{" "}
                                                <Button variant="link" onClick={handleNewTramite} className="p-0">
                                                    Crear el primero
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTramites.map((tramite) => (
                                <TableRow key={tramite.id}>
                                    <TableCell className="font-medium">
                                        <div>
                                            <div>
                                                {tramite.cliente?.nombres} {tramite.cliente?.apellidos}
                                            </div>
                                            {tramite.cliente?.email && (
                                                <div className="text-sm text-muted-foreground">{tramite.cliente.email}</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{tramite.tipoTramite?.nombreTipo || "-"}</TableCell>
                                    <TableCell>
                                        {tramite.estadoProceso?.nombreEstado ? (
                                            <StatusBadge status={tramite.estadoProceso.nombreEstado} type="proceso" />
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {tramite.estadoPago?.nombreEstado ? (
                                            <StatusBadge status={tramite.estadoPago.nombreEstado} type="pago" />
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {tramite.usuarioAsignado?.nombreCompleto || (
                                            <span className="text-muted-foreground">Sin asignar</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{new Date(tramite.fechaCreacion).toLocaleDateString("es-ES")}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditTramite(tramite)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteTramite(tramite)} className="text-red-600">
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

            {/* Drawer para crear/editar */}
            <TramiteDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                tramite={editingTramite}
                onSuccess={handleFormSuccess}
            />

            {/* Dialog de confirmación para eliminar */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el trámite del cliente{" "}
                            <strong>
                                {tramiteToDelete?.cliente?.nombres} {tramiteToDelete?.cliente?.apellidos}
                            </strong>{" "}
                            de la base de datos.
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
