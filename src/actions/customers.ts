"use server"

import { db } from "@/lib/db"
import { clientes } from "@/lib/db/schema"
import { eq, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type { CreateCustomerData, UpdateCustomerData } from "@/types/customer"

// Obtener todos los clientes (solo los no eliminados)
export async function getCustomers() {
    try {
        const result = await db
            .select()
            .from(clientes)
            .where(isNull(clientes.fechaEliminacion))
            .orderBy(clientes.fechaCreacion)
        return { success: true, data: result }
    } catch (error) {
        console.error("Error fetching customers:", error)
        return { success: false, error: "Error al obtener los clientes" }
    }
}

// Crear un nuevo cliente
export async function createCustomer(data: CreateCustomerData) {
    try {
        // Convertir strings de fecha a formato correcto para la base de datos
        const processedData = {
            ...data,
            fechaNacimiento: data.fechaNacimiento || null,
            pasaporteFechaEmision: data.pasaporteFechaEmision || null,
            pasaporteFechaExpiracion: data.pasaporteFechaExpiracion || null,
            conyugeFechaNacimiento: data.conyugeFechaNacimiento || null,
            matrimonioFechaInicio: data.matrimonioFechaInicio || null,
            matrimonioFechaFin: data.matrimonioFechaFin || null,
        }

        const result = await db.insert(clientes).values(processedData).returning()

        revalidatePath("/customers")
        return { success: true, data: result[0] }
    } catch (error) {
        console.error("Error creating customer:", error)
        return { success: false, error: "Error al crear el cliente" }
    }
}

// Actualizar un cliente
export async function updateCustomer(data: UpdateCustomerData) {
    try {
        const { id, ...updateData } = data

        // Convertir strings de fecha a formato correcto para la base de datos
        const processedData = {
            ...updateData,
            fechaNacimiento: updateData.fechaNacimiento || undefined,
            pasaporteFechaEmision: updateData.pasaporteFechaEmision || undefined,
            pasaporteFechaExpiracion: updateData.pasaporteFechaExpiracion || undefined,
            conyugeFechaNacimiento: updateData.conyugeFechaNacimiento || undefined,
            matrimonioFechaInicio: updateData.matrimonioFechaInicio || undefined,
            matrimonioFechaFin: updateData.matrimonioFechaFin || undefined,
            fechaModificacion: new Date(), // Updated line
        }

        const result = await db.update(clientes).set(processedData).where(eq(clientes.id, id)).returning()

        revalidatePath("/customers")
        return { success: true, data: result[0] }
    } catch (error) {
        console.error("Error updating customer:", error)
        return { success: false, error: "Error al actualizar el cliente" }
    }
}

// Eliminar un cliente (soft delete)
export async function deleteCustomer(id: number) {
    try {
        await db
            .update(clientes)
            .set({
                fechaEliminacion: new Date(),
                fechaModificacion: new Date(),
            })
            .where(eq(clientes.id, id))

        revalidatePath("/customers")
        return { success: true }
    } catch (error) {
        console.error("Error deleting customer:", error)
        return { success: false, error: "Error al eliminar el cliente" }
    }
}
