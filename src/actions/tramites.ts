"use server"

import { db } from "@/lib/db"
import { tramites, clientes, catTiposTramite, catEstadosProceso, catEstadosPago, usuarios } from "@/lib/db/schema"
import { eq, isNull, and, desc, gte, lte, ilike, or, type SQL, count } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type { CreateTramiteData, UpdateTramiteData, Tramite, TramiteFilters } from "@/types/tramite"

// Obtener todos los trámites con relaciones
export async function getTramites(filters?: TramiteFilters) {
    try {
        console.log("🔍 Buscando trámites...", filters)

        // Construir condiciones
        const conditions: SQL<unknown>[] = [isNull(tramites.fechaEliminacion)]

        // Aplicar filtros
        if (filters?.clienteId) {
            conditions.push(eq(tramites.clienteId, filters.clienteId))
        }
        if (filters?.tipoTramiteId) {
            conditions.push(eq(tramites.tipoTramiteId, filters.tipoTramiteId))
        }
        if (filters?.estadoProcesoId) {
            conditions.push(eq(tramites.estadoProcesoId, filters.estadoProcesoId))
        }
        if (filters?.estadoPagoId) {
            conditions.push(eq(tramites.estadoPagoId, filters.estadoPagoId))
        }
        if (filters?.fechaDesde) {
            conditions.push(gte(tramites.fechaCreacion, new Date(filters.fechaDesde)))
        }
        if (filters?.fechaHasta) {
            conditions.push(lte(tramites.fechaCreacion, new Date(filters.fechaHasta)))
        }

        const whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions)

        // Query con todas las relaciones
        const rawResult = await db
            .select({
                // Campos de trámite
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
                // Relaciones - AGREGANDO telefonoCelular
                clienteNombres: clientes.nombres,
                clienteApellidos: clientes.apellidos,
                clienteEmail: clientes.email,
                clienteTelefonoCelular: clientes.telefonoCelular, // AGREGADO
                usuarioNombre: usuarios.nombreCompleto,
                usuarioEmail: usuarios.email,
                tipoTramiteNombre: catTiposTramite.nombreTipo,
                estadoProcesoNombre: catEstadosProceso.nombreEstado,
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

        // Transformar el resultado
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
            // Construir objetos de relación - AGREGANDO telefonoCelular
            cliente: {
                id: row.clienteId,
                nombres: row.clienteNombres!,
                apellidos: row.clienteApellidos!,
                email: row.clienteEmail,
                telefonoCelular: row.clienteTelefonoCelular, // AGREGADO
            },
            usuarioAsignado: row.usuarioNombre
                ? {
                    id: row.usuarioAsignadoId!,
                    nombreCompleto: row.usuarioNombre,
                    email: row.usuarioEmail!,
                }
                : null,
            tipoTramite: {
                id: row.tipoTramiteId,
                nombreTipo: row.tipoTramiteNombre!,
            },
            estadoProceso: {
                id: row.estadoProcesoId,
                nombreEstado: row.estadoProcesoNombre!,
            },
            estadoPago: {
                id: row.estadoPagoId,
                nombreEstado: row.estadoPagoNombre!,
            },
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

// Crear nuevo trámite
export async function createTramite(data: CreateTramiteData) {
    try {
        console.log("➕ Creando trámite:", data)

        const result = await db.insert(tramites).values(data).returning()

        console.log("✅ Trámite creado:", result[0].id)
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

// Actualizar trámite
export async function updateTramite(data: UpdateTramiteData) {
    try {
        console.log("📝 Actualizando trámite:", data.id)

        const { id, ...updateData } = data

        // Procesar datos
        const processedData = {
            ...updateData,
            visaFechaEmision: updateData.visaFechaEmision ? new Date(updateData.visaFechaEmision) : undefined,
            visaFechaExpiracion: updateData.visaFechaExpiracion ? new Date(updateData.visaFechaExpiracion) : undefined,
            fechaModificacion: new Date(),
        }

        // Remover campos undefined
        const cleanedData = Object.fromEntries(Object.entries(processedData).filter(([_, value]) => value !== undefined))

        const result = await db.update(tramites).set(cleanedData).where(eq(tramites.id, id)).returning()

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

// Eliminar trámite (soft delete)
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

// Obtener clientes para select
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

// Obtener trámites para select
export async function getTramitesForSelect() {
    try {
        const result = await db
            .select({
                id: tramites.id,
                clienteNombres: clientes.nombres,
                clienteApellidos: clientes.apellidos,
                tipoTramite: catTiposTramite.nombreTipo,
            })
            .from(tramites)
            .leftJoin(clientes, eq(tramites.clienteId, clientes.id))
            .leftJoin(catTiposTramite, eq(tramites.tipoTramiteId, catTiposTramite.id))
            .where(isNull(tramites.fechaEliminacion))
            .orderBy(desc(tramites.fechaCreacion))

        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching tramites for select:", error)
        return { success: false, error: "Error al obtener trámites" }
    }
}

// Obtener tipos de trámite para el formulario
export async function getTiposTramite() {
    try {
        const result = await db.select().from(catTiposTramite).orderBy(catTiposTramite.nombreTipo)
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching tipos tramite:", error)
        return { success: false, error: "Error al obtener tipos de trámite" }
    }
}

// Obtener estados de proceso para el formulario
export async function getEstadosProceso() {
    try {
        const result = await db.select().from(catEstadosProceso).orderBy(catEstadosProceso.nombreEstado)
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching estados proceso:", error)
        return { success: false, error: "Error al obtener estados de proceso" }
    }
}

// Obtener estados de pago para el formulario
export async function getEstadosPago() {
    try {
        const result = await db.select().from(catEstadosPago).orderBy(catEstadosPago.nombreEstado)
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching estados pago:", error)
        return { success: false, error: "Error al obtener estados de pago" }
    }
}

// Obtener usuarios para el formulario
export async function getUsuarios() {
    try {
        const result = await db
            .select({
                id: usuarios.id,
                nombreCompleto: usuarios.nombreCompleto,
                email: usuarios.email,
                rol: usuarios.rol,
            })
            .from(usuarios)
            .where(isNull(usuarios.fechaEliminacion))
            .orderBy(usuarios.nombreCompleto)

        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching usuarios:", error)
        return { success: false, error: "Error al obtener usuarios" }
    }
}

// Obtener estadísticas de trámites
export async function getTramitesStats() {
    try {
        console.log("📊 Obteniendo estadísticas de trámites...")

        const [totalTramites, tramitesEnProceso, tramitesCompletados, tramitesPendientesPago] = await Promise.all([
            // Total de trámites activos
            db
                .select({ count: count() })
                .from(tramites)
                .where(isNull(tramites.fechaEliminacion)),

            // Trámites en proceso (asumiendo que hay un estado "En Proceso")
            db
                .select({ count: count() })
                .from(tramites)
                .leftJoin(catEstadosProceso, eq(tramites.estadoProcesoId, catEstadosProceso.id))
                .where(and(isNull(tramites.fechaEliminacion), ilike(catEstadosProceso.nombreEstado, "%proceso%"))),

            // Trámites completados (asumiendo que hay un estado "Completado")
            db
                .select({ count: count() })
                .from(tramites)
                .leftJoin(catEstadosProceso, eq(tramites.estadoProcesoId, catEstadosProceso.id))
                .where(and(isNull(tramites.fechaEliminacion), ilike(catEstadosProceso.nombreEstado, "%completado%"))),

            // Trámites con pagos pendientes (asumiendo que hay un estado "Pendiente")
            db
                .select({ count: count() })
                .from(tramites)
                .leftJoin(catEstadosPago, eq(tramites.estadoPagoId, catEstadosPago.id))
                .where(and(isNull(tramites.fechaEliminacion), ilike(catEstadosPago.nombreEstado, "%pendiente%"))),
        ])

        const stats = {
            totalTramites: totalTramites[0]?.count || 0,
            tramitesEnProceso: tramitesEnProceso[0]?.count || 0,
            tramitesCompletados: tramitesCompletados[0]?.count || 0,
            tramitesPendientesPago: tramitesPendientesPago[0]?.count || 0,
        }

        console.log("✅ Estadísticas de trámites obtenidas:", stats)
        return { success: true, data: stats }
    } catch (error) {
        console.error("❌ Error fetching tramites stats:", error)
        return { success: false, error: "Error al obtener estadísticas de trámites" }
    }
}

// Buscar trámites
export async function searchTramites(searchTerm: string) {
    try {
        console.log("🔍 Buscando trámites:", searchTerm)

        if (!searchTerm.trim()) {
            return getTramites()
        }

        const searchPattern = `%${searchTerm.trim()}%`
        const conditions = [
            isNull(tramites.fechaEliminacion),
            or(
                ilike(clientes.nombres, searchPattern),
                ilike(clientes.apellidos, searchPattern),
                ilike(tramites.codigoConfirmacionDs160, searchPattern),
                ilike(tramites.codigoSeguimientoCourier, searchPattern),
                ilike(tramites.visaNumero, searchPattern),
                ilike(catTiposTramite.nombreTipo, searchPattern),
            ),
        ]

        const whereCondition = and(...conditions)

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
                clienteNombres: clientes.nombres,
                clienteApellidos: clientes.apellidos,
                clienteEmail: clientes.email,
                clienteTelefonoCelular: clientes.telefonoCelular, // AGREGADO
                usuarioNombre: usuarios.nombreCompleto,
                usuarioEmail: usuarios.email,
                tipoTramiteNombre: catTiposTramite.nombreTipo,
                estadoProcesoNombre: catEstadosProceso.nombreEstado,
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
            cliente: {
                id: row.clienteId,
                nombres: row.clienteNombres!,
                apellidos: row.clienteApellidos!,
                email: row.clienteEmail,
                telefonoCelular: row.clienteTelefonoCelular, // AGREGADO
            },
            usuarioAsignado: row.usuarioNombre
                ? {
                    id: row.usuarioAsignadoId!,
                    nombreCompleto: row.usuarioNombre,
                    email: row.usuarioEmail!,
                }
                : null,
            tipoTramite: {
                id: row.tipoTramiteId,
                nombreTipo: row.tipoTramiteNombre!,
            },
            estadoProceso: {
                id: row.estadoProcesoId,
                nombreEstado: row.estadoProcesoNombre!,
            },
            estadoPago: {
                id: row.estadoPagoId,
                nombreEstado: row.estadoPagoNombre!,
            },
        }))

        console.log("✅ Trámites encontrados en búsqueda:", result.length)
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error searching tramites:", error)
        return { success: false, error: "Error en la búsqueda de trámites" }
    }
}
