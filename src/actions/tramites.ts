"use server"

import { db } from "@/lib/db"
import { tramites, clientes, usuarios, catTiposTramite, catEstadosProceso, catEstadosPago } from "@/lib/db/schema"
import { eq, isNull, or, ilike, and, desc, type SQL } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type { CreateTramiteData, UpdateTramiteData, Tramite } from "@/types/tramite"

// Obtener todos los trámites con relaciones
export async function getTramites(searchTerm?: string) {
    try {
        console.log("🔍 Buscando trámites...", { searchTerm })

        // Construir array de condiciones
        const conditions: SQL<unknown>[] = [isNull(tramites.fechaEliminacion)]

        // Si hay término de búsqueda, agregar filtros
        if (searchTerm && searchTerm.trim() !== "") {
            const searchPattern = `%${searchTerm.trim()}%`
            const searchCondition = or(
                ilike(clientes.nombres, searchPattern),
                ilike(clientes.apellidos, searchPattern),
                ilike(tramites.codigoConfirmacionDs160, searchPattern),
                ilike(tramites.codigoSeguimientoCourier, searchPattern),
                ilike(tramites.visaNumero, searchPattern),
            )

            if (searchCondition) {
                conditions.push(searchCondition)
            }
        }

        const whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions)

        // Query con todas las relaciones
        const rawResult = await db
            .select({
                id: tramites.id,
                clienteId: tramites.clienteId,
                usuarioAsignadoId: tramites.usuarioAsignadoId,
                tipoTramiteId: tramites.tipoTramiteId,
                estadoProcesoId: tramites.estadoProcesoId,
                estadoPagoId: tramites.estadoPagoId,
                codigoConfirmacionDs160: tramites.codigoConfirmacionDs160,
                codigoSeguimientoCourier: tramites.codigoSeguimientoCourier,
                visaNumero: tramites.visaNumero,
                visaFechaEmision: tramites.visaFechaEmision,
                visaFechaExpiracion: tramites.visaFechaExpiracion,
                notas: tramites.notas,
                fechaCreacion: tramites.fechaCreacion,
                fechaModificacion: tramites.fechaModificacion,
                fechaEliminacion: tramites.fechaEliminacion,
                // Relaciones
                clienteId_rel: clientes.id,
                clienteNombres: clientes.nombres,
                clienteApellidos: clientes.apellidos,
                clienteEmail: clientes.email,
                clienteTelefono: clientes.telefonoCelular,
                usuarioId_rel: usuarios.id,
                usuarioNombre: usuarios.nombreCompleto,
                usuarioEmail: usuarios.email,
                tipoTramiteId_rel: catTiposTramite.id,
                tipoTramiteNombre: catTiposTramite.nombreTipo,
                estadoProcesoId_rel: catEstadosProceso.id,
                estadoProcesoNombre: catEstadosProceso.nombreEstado,
                estadoPagoId_rel: catEstadosPago.id,
                estadoPagoNombre: catEstadosPago.nombreEstado,
            })
            .from(tramites)
            .leftJoin(clientes, eq(tramites.clienteId, clientes.id))
            .leftJoin(usuarios, eq(tramites.usuarioAsignadoId, usuarios.id))
            .leftJoin(catTiposTramite, eq(tramites.tipoTramiteId, catTiposTramite.id))
            .leftJoin(catEstadosProceso, eq(tramites.estadoProcesoId, catEstadosProceso.id))
            .leftJoin(catEstadosPago, eq(tramites.estadoPagoId, catEstadosPago.id))
            .where(whereCondition)
            .orderBy(desc(tramites.fechaCreacion))

        // Transformar el resultado para que coincida con el tipo Tramite
        const result: Tramite[] = rawResult.map((row) => ({
            id: row.id,
            clienteId: row.clienteId,
            usuarioAsignadoId: row.usuarioAsignadoId,
            tipoTramiteId: row.tipoTramiteId,
            estadoProcesoId: row.estadoProcesoId,
            estadoPagoId: row.estadoPagoId,
            codigoConfirmacionDs160: row.codigoConfirmacionDs160,
            codigoSeguimientoCourier: row.codigoSeguimientoCourier,
            visaNumero: row.visaNumero,
            visaFechaEmision: row.visaFechaEmision,
            visaFechaExpiracion: row.visaFechaExpiracion,
            notas: row.notas,
            fechaCreacion: row.fechaCreacion,
            fechaModificacion: row.fechaModificacion,
            fechaEliminacion: row.fechaEliminacion,
            // Construir objetos de relación solo si existen
            cliente: row.clienteId_rel
                ? {
                    id: row.clienteId_rel,
                    nombres: row.clienteNombres!,
                    apellidos: row.clienteApellidos!,
                    email: row.clienteEmail,
                    telefonoCelular: row.clienteTelefono,
                }
                : null,
            usuarioAsignado: row.usuarioId_rel
                ? {
                    id: row.usuarioId_rel,
                    nombreCompleto: row.usuarioNombre!,
                    email: row.usuarioEmail!,
                }
                : null,
            tipoTramite: row.tipoTramiteId_rel
                ? {
                    id: row.tipoTramiteId_rel,
                    nombreTipo: row.tipoTramiteNombre!,
                }
                : null,
            estadoProceso: row.estadoProcesoId_rel
                ? {
                    id: row.estadoProcesoId_rel,
                    nombreEstado: row.estadoProcesoNombre!,
                }
                : null,
            estadoPago: row.estadoPagoId_rel
                ? {
                    id: row.estadoPagoId_rel,
                    nombreEstado: row.estadoPagoNombre!,
                }
                : null,
        }))

        console.log("✅ Trámites encontrados:", result.length)
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching tramites:", error)
        return {
            success: false,
            error: `Error al obtener los trámites: ${error instanceof Error ? error.message : "Error desconocido"}`,
        }
    }
}

// Crear un nuevo trámite
export async function createTramite(data: CreateTramiteData) {
    try {
        console.log("📝 Creando trámite para cliente:", data.clienteId)

        // Convertir strings vacías a null para campos opcionales
        const processedData = {
            ...data,
            usuarioAsignadoId: data.usuarioAsignadoId || null,
            codigoConfirmacionDs160: data.codigoConfirmacionDs160 || null,
            codigoSeguimientoCourier: data.codigoSeguimientoCourier || null,
            visaNumero: data.visaNumero || null,
            visaFechaEmision: data.visaFechaEmision || null,
            visaFechaExpiracion: data.visaFechaExpiracion || null,
            notas: data.notas || null,
        }

        const result = await db.insert(tramites).values(processedData).returning()

        console.log("✅ Trámite creado exitosamente:", result[0].id)

        revalidatePath("/protected/tramites")
        return { success: true, data: result[0] }
    } catch (error) {
        console.error("❌ Error creating tramite:", error)
        return {
            success: false,
            error: `Error al crear el trámite: ${error instanceof Error ? error.message : "Error desconocido"}`,
        }
    }
}

// Actualizar un trámite
export async function updateTramite(data: UpdateTramiteData) {
    try {
        console.log("📝 Actualizando trámite:", data.id)

        const { id, ...updateData } = data

        // Convertir strings vacías a null y agregar fecha de modificación
        const processedData = {
            ...updateData,
            usuarioAsignadoId: updateData.usuarioAsignadoId || null,
            codigoConfirmacionDs160: updateData.codigoConfirmacionDs160 || null,
            codigoSeguimientoCourier: updateData.codigoSeguimientoCourier || null,
            visaNumero: updateData.visaNumero || null,
            visaFechaEmision: updateData.visaFechaEmision || null,
            visaFechaExpiracion: updateData.visaFechaExpiracion || null,
            notas: updateData.notas || null,
            fechaModificacion: new Date(),
        }

        const result = await db.update(tramites).set(processedData).where(eq(tramites.id, id)).returning()

        console.log("✅ Trámite actualizado:", result[0].id)
        revalidatePath("/protected/tramites")
        return { success: true, data: result[0] }
    } catch (error) {
        console.error("❌ Error updating tramite:", error)
        return {
            success: false,
            error: `Error al actualizar el trámite: ${error instanceof Error ? error.message : "Error desconocido"}`,
        }
    }
}

// Eliminar un trámite (soft delete)
export async function deleteTramite(id: number) {
    try {
        console.log("🗑️ Eliminando trámite:", id)

        await db
            .update(tramites)
            .set({
                fechaEliminacion: new Date(),
                fechaModificacion: new Date(),
            })
            .where(eq(tramites.id, id))

        console.log("✅ Trámite eliminado:", id)
        revalidatePath("/protected/tramites")
        return { success: true }
    } catch (error) {
        console.error("❌ Error deleting tramite:", error)
        return {
            success: false,
            error: `Error al eliminar el trámite: ${error instanceof Error ? error.message : "Error desconocido"}`,
        }
    }
}

// Obtener catálogos para los formularios
export async function getTiposTramite() {
    try {
        const result = await db.select().from(catTiposTramite).orderBy(catTiposTramite.nombreTipo)
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching tipos tramite:", error)
        return { success: false, error: "Error al obtener tipos de trámite" }
    }
}

export async function getEstadosProceso() {
    try {
        const result = await db.select().from(catEstadosProceso).orderBy(catEstadosProceso.nombreEstado)
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching estados proceso:", error)
        return { success: false, error: "Error al obtener estados de proceso" }
    }
}

export async function getEstadosPago() {
    try {
        const result = await db.select().from(catEstadosPago).orderBy(catEstadosPago.nombreEstado)
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching estados pago:", error)
        return { success: false, error: "Error al obtener estados de pago" }
    }
}

// Obtener clientes para el selector
export async function getClientesForSelect() {
    try {
        const result = await db
            .select({
                id: clientes.id,
                nombres: clientes.nombres,
                apellidos: clientes.apellidos,
                email: clientes.email,
            })
            .from(clientes)
            .where(isNull(clientes.fechaEliminacion))
            .orderBy(clientes.nombres, clientes.apellidos)

        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching clientes for select:", error)
        return { success: false, error: "Error al obtener clientes" }
    }
}

// Obtener usuarios para el selector
export async function getUsuariosForSelect() {
    try {
        const result = await db
            .select({
                id: usuarios.id,
                nombreCompleto: usuarios.nombreCompleto,
                email: usuarios.email,
            })
            .from(usuarios)
            .where(isNull(usuarios.fechaEliminacion))
            .orderBy(usuarios.nombreCompleto)

        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching usuarios for select:", error)
        return { success: false, error: "Error al obtener usuarios" }
    }
}
