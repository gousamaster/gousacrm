"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Pencil, Trash2, MoreHorizontal, Search } from "lucide-react"

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
import { CustomerDrawer } from "./customer-drawer"
import { CustomersSkeleton } from "./customers-skeleton"
import { getCustomers, deleteCustomer } from "@/actions/customers"
import type { Customer } from "@/types/customer"

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)

    // Cargar clientes
    const loadCustomers = async (search?: string) => {
        setLoading(true)
        try {
            const result = await getCustomers(search)
            if (result.success) {
                setCustomers(result.data || [])
                console.log("📊 Clientes cargados:", result.data?.length || 0)
            } else {
                setCustomers([])
                console.error("❌ Error loading customers:", result.error)
            }
        } catch (error) {
            console.error("❌ Error inesperado:", error)
            setCustomers([])
        } finally {
            setLoading(false)
        }
    }

    // Cargar clientes al montar el componente
    useEffect(() => {
        loadCustomers()
    }, [])

    // Filtrar clientes en tiempo real (búsqueda del lado del cliente)
    const filteredCustomers = useMemo(() => {
        if (!searchTerm.trim()) return customers

        const search = searchTerm.toLowerCase().trim()
        return customers.filter(
            (customer) =>
                customer.nombres.toLowerCase().includes(search) ||
                customer.apellidos.toLowerCase().includes(search) ||
                customer.numeroCi?.toLowerCase().includes(search) ||
                customer.numeroPasaporte?.toLowerCase().includes(search) ||
                customer.email?.toLowerCase().includes(search),
        )
    }, [customers, searchTerm])

    // Manejar búsqueda
    const handleSearch = (value: string) => {
        setSearchTerm(value)
    }

    // Manejar creación de nuevo cliente
    const handleNewCustomer = () => {
        setEditingCustomer(undefined)
        setDrawerOpen(true)
    }

    // Manejar edición de cliente
    const handleEditCustomer = (customer: Customer) => {
        setEditingCustomer(customer)
        setDrawerOpen(true)
    }

    // Manejar eliminación de cliente
    const handleDeleteCustomer = (customer: Customer) => {
        setCustomerToDelete(customer)
        setDeleteDialogOpen(true)
    }

    // Confirmar eliminación
    const confirmDelete = async () => {
        if (customerToDelete) {
            const result = await deleteCustomer(customerToDelete.id)
            if (result.success) {
                await loadCustomers(searchTerm)
            }
            setDeleteDialogOpen(false)
            setCustomerToDelete(null)
        }
    }

    // Manejar éxito en formulario
    const handleFormSuccess = async () => {
        await loadCustomers(searchTerm)
    }

    // Mostrar skeleton mientras carga
    if (loading) {
        return <CustomersSkeleton />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Clientes</h1>
                    <p className="text-muted-foreground">Gestiona tu base de datos de clientes</p>
                </div>
                <Button onClick={handleNewCustomer}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Cliente
                </Button>
            </div>

            {/* Barra de búsqueda */}
            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Buscar por nombre, CI, pasaporte o email..."
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

            {/* Estadísticas */}
            <div className="flex items-center text-sm text-muted-foreground">
                <span>
                    {searchTerm
                        ? `${filteredCustomers.length} de ${customers.length} clientes`
                        : `${customers.length} clientes en total`}
                </span>
            </div>

            {/* Tabla de clientes */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre Completo</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>CI/Pasaporte</TableHead>
                            <TableHead>Estado Civil</TableHead>
                            <TableHead>Fecha de Creación</TableHead>
                            <TableHead className="w-[70px]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCustomers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <div className="text-muted-foreground">
                                        {searchTerm ? (
                                            <>
                                                No se encontraron clientes que coincidan con "{searchTerm}".{" "}
                                                <Button variant="link" onClick={() => handleSearch("")} className="p-0">
                                                    Limpiar búsqueda
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                No hay clientes registrados.{" "}
                                                <Button variant="link" onClick={handleNewCustomer} className="p-0">
                                                    Crear el primero
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium">
                                        {customer.nombres} {customer.apellidos}
                                    </TableCell>
                                    <TableCell>{customer.email || "-"}</TableCell>
                                    <TableCell>{customer.telefonoCelular || "-"}</TableCell>
                                    <TableCell>{customer.numeroCi || customer.numeroPasaporte || "-"}</TableCell>
                                    <TableCell>{customer.estadoCivil || "-"}</TableCell>
                                    <TableCell>{new Date(customer.fechaCreacion).toLocaleDateString("es-ES")}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteCustomer(customer)} className="text-red-600">
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
            <CustomerDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                customer={editingCustomer}
                onSuccess={handleFormSuccess}
            />

            {/* Dialog de confirmación para eliminar */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el cliente{" "}
                            <strong>
                                {customerToDelete?.nombres} {customerToDelete?.apellidos}
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
