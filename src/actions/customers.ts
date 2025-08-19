"use server"

import { db } from "@/lib/db"
import { clientes } from "@/lib/db/schema"
import { eq, isNull, or, ilike, and, desc, type SQL } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type { CreateCustomerData, UpdateCustomerData } from "@/types/customer"

// Obtener todos los clientes (solo los no eliminados) con búsqueda opcional
export async function getCustomers(searchTerm?: string) {
    try {
        console.log("🔍 Buscando clientes...", { searchTerm })
        console.log("🔗 DATABASE_URL configurada:", !!process.env.DATABASE_URL)

        // Construir array de condiciones
        const conditions: SQL<unknown>[] = [isNull(clientes.fechaEliminacion)]

        // Si hay término de búsqueda, agregar filtros de búsqueda
        if (searchTerm && searchTerm.trim() !== "") {
            const searchPattern = `%${searchTerm.trim()}%`
            const searchCondition = or(
                ilike(clientes.nombres, searchPattern),
                ilike(clientes.apellidos, searchPattern),
                ilike(clientes.numeroCi, searchPattern),
                ilike(clientes.numeroPasaporte, searchPattern),
                ilike(clientes.email, searchPattern),
                ilike(clientes.motivoRecoleccionDatos, searchPattern)
            )

            // Solo agregar si searchCondition no es undefined
            if (searchCondition) {
                conditions.push(searchCondition)
            }
        }

        // Combinar todas las condiciones
        const whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions)

        // Ejecutar la query
        const result = await db.select().from(clientes).where(whereCondition).orderBy(desc(clientes.fechaCreacion))

        console.log("✅ Clientes encontrados:", result.length)
        if (result.length > 0) {
            console.log("📊 Primer cliente:", {
                id: result[0].id,
                nombres: result[0].nombres,
                apellidos: result[0].apellidos,
                fechaCreacion: result[0].fechaCreacion,
            })
        }
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error detallado fetching customers:", error)
        console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack available")
        return {
            success: false,
            error: `Error al obtener los clientes: ${error instanceof Error ? error.message : "Error desconocido"}`,
        }
    }
}

// Crear un nuevo cliente
export async function createCustomer(data: CreateCustomerData) {
    try {
        console.log("📝 Creando cliente:", data.nombres, data.apellidos)

        // Convertir strings vacías a null para campos opcionales
        const processedData = {
            ...data,
            fechaNacimiento: data.fechaNacimiento || null,
            lugarNacimiento: data.lugarNacimiento || null,
            numeroCi: data.numeroCi || null,
            numeroPasaporte: data.numeroPasaporte || null,
            pasaporteFechaEmision: data.pasaporteFechaEmision || null,
            pasaporteFechaExpiracion: data.pasaporteFechaExpiracion || null,
            email: data.email || null,
            telefonoCelular: data.telefonoCelular || null,
            direccionDomicilio: data.direccionDomicilio || null,
            estadoCivil: data.estadoCivil || null,
            profesion: data.profesion || null,
            conyugeNombreCompleto: data.conyugeNombreCompleto || null,
            conyugeFechaNacimiento: data.conyugeFechaNacimiento || null,
            conyugeLugarNacimiento: data.conyugeLugarNacimiento || null,
            matrimonioFechaInicio: data.matrimonioFechaInicio || null,
            matrimonioFechaFin: data.matrimonioFechaFin || null,
            motivoRecoleccionDatos: data.motivoRecoleccionDatos || null,
        }

        const result = await db.insert(clientes).values(processedData).returning()

        console.log("✅ Cliente creado exitosamente:", {
            id: result[0].id,
            nombres: result[0].nombres,
            apellidos: result[0].apellidos,
        })

        revalidatePath("/customers")
        return { success: true, data: result[0] }
    } catch (error) {
        console.error("❌ Error creating customer:", error)
        return {
            success: false,
            error: `Error al crear el cliente: ${error instanceof Error ? error.message : "Error desconocido"}`,
        }
    }
}

// Actualizar un cliente
export async function updateCustomer(data: UpdateCustomerData) {
    try {
        console.log("📝 Actualizando cliente:", data.id)

        const { id, ...updateData } = data

        // Convertir strings vacías a null y agregar fecha de modificación
        const processedData = {
            ...updateData,
            fechaNacimiento: updateData.fechaNacimiento || null,
            lugarNacimiento: updateData.lugarNacimiento || null,
            numeroCi: updateData.numeroCi || null,
            numeroPasaporte: updateData.numeroPasaporte || null,
            pasaporteFechaEmision: updateData.pasaporteFechaEmision || null,
            pasaporteFechaExpiracion: updateData.pasaporteFechaExpiracion || null,
            email: updateData.email || null,
            telefonoCelular: updateData.telefonoCelular || null,
            direccionDomicilio: updateData.direccionDomicilio || null,
            estadoCivil: updateData.estadoCivil || null,
            profesion: updateData.profesion || null,
            conyugeNombreCompleto: updateData.conyugeNombreCompleto || null,
            conyugeFechaNacimiento: updateData.conyugeFechaNacimiento || null,
            conyugeLugarNacimiento: updateData.conyugeLugarNacimiento || null,
            matrimonioFechaInicio: updateData.matrimonioFechaInicio || null,
            matrimonioFechaFin: updateData.matrimonioFechaFin || null,
            motivoRecoleccionDatos: updateData.motivoRecoleccionDatos || null,
            fechaModificacion: new Date(),
        }

        const result = await db.update(clientes).set(processedData).where(eq(clientes.id, id)).returning()

        console.log("✅ Cliente actualizado:", result[0].id)
        revalidatePath("/customers")
        return { success: true, data: result[0] }
    } catch (error) {
        console.error("❌ Error updating customer:", error)
        return {
            success: false,
            error: `Error al actualizar el cliente: ${error instanceof Error ? error.message : "Error desconocido"}`,
        }
    }
}

// Eliminar un cliente (soft delete)
export async function deleteCustomer(id: number) {
    try {
        console.log("🗑️ Eliminando cliente:", id)

        await db
            .update(clientes)
            .set({
                fechaEliminacion: new Date(),
                fechaModificacion: new Date(),
            })
            .where(eq(clientes.id, id))

        console.log("✅ Cliente eliminado:", id)
        revalidatePath("/customers")
        return { success: true }
    } catch (error) {
        console.error("❌ Error deleting customer:", error)
        return {
            success: false,
            error: `Error al eliminar el cliente: ${error instanceof Error ? error.message : "Error desconocido"}`,
        }
    }
}
