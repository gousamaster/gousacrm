"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { CustomerDrawer } from "@/components/customers/customer-drawer"
import { getCustomers, deleteCustomer } from "@/actions/customers"
import type { Customer } from "@/types/customer"

const statusLabels = {
    active: "Activo",
    inactive: "Inactivo",
    prospect: "Prospecto",
    lead: "Lead",
}

const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    prospect: "bg-blue-100 text-blue-800",
    lead: "bg-yellow-100 text-yellow-800",
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)

    // Cargar clientes
    const loadCustomers = async () => {
        setLoading(true)
        const result = await getCustomers()
        if (result.success) {
            setCustomers(result.data || [])
        } else {
            setCustomers([])
            console.error("Error loading customers:", result.error)
        }
        setLoading(false)
    }

    useEffect(() => {
        loadCustomers()
    }, [])

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
                await loadCustomers()
            }
            setDeleteDialogOpen(false)
            setCustomerToDelete(null)
        }
    }

    // Manejar éxito en formulario
    const handleFormSuccess = async () => {
        await loadCustomers()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Cargando clientes...</div>
            </div>
        )
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
                        {customers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <div className="text-muted-foreground">
                                        No hay clientes registrados.{" "}
                                        <Button variant="link" onClick={handleNewCustomer} className="p-0">
                                            Crear el primero
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.map((customer) => (
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
