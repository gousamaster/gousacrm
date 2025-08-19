"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Pencil, Trash2, MoreHorizontal, Search, Filter, Package, Calendar, Users } from "lucide-react"

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
import { ServicioComplementarioDrawer } from "./servicio-complementario-drawer"
import { ServiciosComplementariosSkeleton } from "./servicios-complementarios-skeleton"
import { getServiciosComplementarios, deleteServicioComplementario } from "@/actions/servicios-complementarios"
import type { ServicioComplementario } from "@/types/servicio-complementario"

export default function ServiciosComplementariosPage() {
    const [servicios, setServicios] = useState<ServicioComplementario[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [tipoFilter, setTipoFilter] = useState<string>("all")
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editingServicio, setEditingServicio] = useState<ServicioComplementario | undefined>()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [servicioToDelete, setServicioToDelete] = useState<ServicioComplementario | null>(null)

    // Cargar servicios
    const loadServicios = async () => {
        setLoading(true)
        try {
            const result = await getServiciosComplementarios()
            if (result.success) {
                setServicios(result.data || [])
                console.log("📊 Servicios complementarios cargados:", result.data?.length || 0)
            } else {
                setServicios([])
                console.error("❌ Error loading servicios:", result.error)
            }
        } catch (error) {
            console.error("❌ Error inesperado:", error)
            setServicios([])
        } finally {
            setLoading(false)
        }
    }

    // Cargar servicios al montar el componente
    useEffect(() => {
        loadServicios()
    }, [])

    // Filtrar servicios
    const filteredServicios = useMemo(() => {
        let filtered = servicios

        // Filtro por término de búsqueda
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase().trim()
            filtered = filtered.filter(
                (servicio) =>
                    servicio.cliente?.nombres?.toLowerCase().includes(search) ||
                    servicio.cliente?.apellidos?.toLowerCase().includes(search) ||
                    servicio.descripcion?.toLowerCase().includes(search) ||
                    servicio.tipoServicio?.nombreServicio?.toLowerCase().includes(search),
            )
        }

        // Filtro por tipo de servicio
        if (tipoFilter !== "all") {
            filtered = filtered.filter((servicio) => {
                switch (tipoFilter) {
                    case "activos":
                        return !servicio.fechaFinServicio || new Date(servicio.fechaFinServicio) >= new Date()
                    case "finalizados":
                        return servicio.fechaFinServicio && new Date(servicio.fechaFinServicio) < new Date()
                    case "este_mes":
                        const thisMonth = new Date()
                        const serviceDate = new Date(servicio.fechaCreacion)
                        return serviceDate.getMonth() === thisMonth.getMonth() && serviceDate.getFullYear() === thisMonth.getFullYear()
                    default:
                        return servicio.tipoServicio?.nombreServicio?.toLowerCase().includes(tipoFilter.toLowerCase())
                }
            })
        }

        return filtered
    }, [servicios, searchTerm, tipoFilter])

    // Estadísticas
    const stats = useMemo(() => {
        const total = servicios.length
        const activos = servicios.filter(s => !s.fechaFinServicio || new Date(s.fechaFinServicio) >= new Date()).length
        const finalizados = servicios.filter(s => s.fechaFinServicio && new Date(s.fechaFinServicio) < new Date()).length
        const esteMes = servicios.filter(s => {
            const thisMonth = new Date()
            const serviceDate = new Date(s.fechaCreacion)
            return serviceDate.getMonth() === thisMonth.getMonth() && serviceDate.getFullYear() === thisMonth.getFullYear()
        }).length

        return { total, activos, finalizados, esteMes }
    }, [servicios])

    // Manejar búsqueda
    const handleSearch = (value: string) => {
        setSearchTerm(value)
    }

    // Manejar creación de nuevo servicio
    const handleNewServicio = () => {
        setEditingServicio(undefined)
        setDrawerOpen(true)
    }

    // Manejar edición de servicio
    const handleEditServicio = (servicio: ServicioComplementario) => {
        setEditingServicio(servicio)
        setDrawerOpen(true)
    }

    // Manejar eliminación de servicio
    const handleDeleteServicio = (servicio: ServicioComplementario) => {
        setServicioToDelete(servicio)
        setDeleteDialogOpen(true)
    }

    // Confirmar eliminación
    const confirmDelete = async () => {
        if (servicioToDelete) {
            const result = await deleteServicioComplementario(servicioToDelete.id)
            if (result.success) {
                await loadServicios()
            }
            setDeleteDialogOpen(false)
            setServicioToDelete(null)
        }
    }

    // Manejar éxito en formulario
    const handleFormSuccess = async () => {
        await loadServicios()
    }

    // Mostrar skeleton mientras carga
    if (loading) {
        return <ServiciosComplementariosSkeleton />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Servicios Complementarios</h1>
                    <p className="text-muted-foreground">Gestiona los servicios adicionales de tus clientes</p>
                </div>
                <Button onClick={handleNewServicio}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Servicio
                </Button>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Servicios Activos</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.activos}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-600">{stats.finalizados}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.esteMes}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros y búsqueda */}
            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Buscar por cliente, descripción, tipo..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={tipoFilter} onValueChange={setTipoFilter}>
                    <SelectTrigger className="w-48">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los servicios</SelectItem>
                        <SelectItem value="activos">Servicios Activos</SelectItem>
                        <SelectItem value="finalizados">Finalizados</SelectItem>
                        <SelectItem value="este_mes">Este Mes</SelectItem>
                    </SelectContent>
                </Select>
                {(searchTerm || tipoFilter !== "all") && (
                    <Button
                        variant="outline"
                        onClick={() => {
                            handleSearch("")
                            setTipoFilter("all")
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
                    {searchTerm || tipoFilter !== "all"
                        ? `${filteredServicios.length} de ${servicios.length} servicios`
                        : `${servicios.length} servicios en total`}
                </span>
            </div>

            {/* Tabla de servicios */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Tipo de Servicio</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Usuario Responsable</TableHead>
                            <TableHead>Fecha Inicio</TableHead>
                            <TableHead>Fecha Fin</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="w-[70px]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredServicios.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8">
                                    <div className="text-muted-foreground">
                                        {searchTerm || tipoFilter !== "all" ? (
                                            <>
                                                No se encontraron servicios que coincidan con los filtros.{" "}
                                                <Button
                                                    variant="link"
                                                    onClick={() => {
                                                        handleSearch("")
                                                        setTipoFilter("all")
                                                    }}
                                                    className="p-0"
                                                >
                                                    Limpiar filtros
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                No hay servicios complementarios registrados.{" "}
                                                <Button variant="link" onClick={handleNewServicio} className="p-0">
                                                    Crear el primero
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredServicios.map((servicio) => (
                                <TableRow key={servicio.id}>
                                    <TableCell className="font-medium">
                                        <div>
                                            <div>
                                                {servicio.cliente?.nombres} {servicio.cliente?.apellidos}
                                            </div>
                                            {servicio.cliente?.email && (
                                                <div className="text-sm text-muted-foreground">{servicio.cliente.email}</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{servicio.tipoServicio?.nombreServicio || "-"}</TableCell>
                                    <TableCell>
                                        <div className="max-w-xs truncate" title={servicio.descripcion || ""}>
                                            {servicio.descripcion || "-"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {servicio.usuarioResponsable?.nombreCompleto || (
                                            <span className="text-muted-foreground">Sin asignar</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {servicio.fechaInicioServicio
                                            ? new Date(servicio.fechaInicioServicio).toLocaleDateString("es-ES")
                                            : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {servicio.fechaFinServicio
                                            ? new Date(servicio.fechaFinServicio).toLocaleDateString("es-ES")
                                            : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {!servicio.fechaFinServicio || new Date(servicio.fechaFinServicio) >= new Date() ? (
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                Activo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                                Finalizado
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditServicio(servicio)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteServicio(servicio)} className="text-red-600">
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
            <ServicioComplementarioDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                servicio={editingServicio}
                onSuccess={handleFormSuccess}
            />

            {/* Dialog de confirmación para eliminar */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el servicio del cliente{" "}
                            <strong>
                                {servicioToDelete?.cliente?.nombres} {servicioToDelete?.cliente?.apellidos}
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