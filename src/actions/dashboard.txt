"use server"

import { db } from "@/lib/db"
import { tramites, clientes, usuarios, catTiposTramite, catEstadosProceso, catEstadosPago } from "@/lib/db/schema"
import { eq, isNull, count, desc, sql } from "drizzle-orm"

// Obtener estadísticas generales
export async function getDashboardStats() {
    try {
        console.log("📊 Obteniendo estadísticas del dashboard...")

        // Estadísticas básicas
        const [clientesTotal, tramitesTotal, tramitesActivos, clientesRecientes] = await Promise.all([
            // Total de clientes activos
            db
                .select({ count: count() })
                .from(clientes)
                .where(isNull(clientes.fechaEliminacion)),

            // Total de trámites activos
            db
                .select({ count: count() })
                .from(tramites)
                .where(isNull(tramites.fechaEliminacion)),

            // Trámites en proceso (no completados)
            db
                .select({ count: count() })
                .from(tramites)
                .leftJoin(catEstadosProceso, eq(tramites.estadoProcesoId, catEstadosProceso.id))
                .where(
                    sql`${tramites.fechaEliminacion} IS NULL AND LOWER(${catEstadosProceso.nombreEstado}) NOT LIKE '%completado%'`,
                ),

            // Clientes registrados en los últimos 30 días
            db
                .select({ count: count() })
                .from(clientes)
                .where(sql`${clientes.fechaEliminacion} IS NULL AND ${clientes.fechaCreacion} >= NOW() - INTERVAL '30 days'`),
        ])

        const stats = {
            totalClientes: clientesTotal[0]?.count || 0,
            totalTramites: tramitesTotal[0]?.count || 0,
            tramitesActivos: tramitesActivos[0]?.count || 0,
            clientesRecientes: clientesRecientes[0]?.count || 0,
        }

        console.log("✅ Estadísticas obtenidas:", stats)
        return { success: true, data: stats }
    } catch (error) {
        console.error("❌ Error fetching dashboard stats:", error)
        return {
            success: false,
            error: `Error al obtener estadísticas: ${error instanceof Error ? error.message : "Error desconocido"}`,
        }
    }
}

// Obtener distribución de estados de trámites
export async function getTramitesEstadosDistribution() {
    try {
        console.log("📊 Obteniendo distribución de estados...")

        const result = await db
            .select({
                estado: catEstadosProceso.nombreEstado,
                count: count(),
            })
            .from(tramites)
            .leftJoin(catEstadosProceso, eq(tramites.estadoProcesoId, catEstadosProceso.id))
            .where(isNull(tramites.fechaEliminacion))
            .groupBy(catEstadosProceso.nombreEstado)
            .orderBy(desc(count()))

        console.log("✅ Distribución de estados obtenida:", result.length)
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching estados distribution:", error)
        return { success: false, error: "Error al obtener distribución de estados" }
    }
}

// Obtener distribución de tipos de trámites
export async function getTiposTramitesDistribution() {
    try {
        console.log("📊 Obteniendo distribución de tipos de trámites...")

        const result = await db
            .select({
                tipo: catTiposTramite.nombreTipo,
                count: count(),
            })
            .from(tramites)
            .leftJoin(catTiposTramite, eq(tramites.tipoTramiteId, catTiposTramite.id))
            .where(isNull(tramites.fechaEliminacion))
            .groupBy(catTiposTramite.nombreTipo)
            .orderBy(desc(count()))

        console.log("✅ Distribución de tipos obtenida:", result.length)
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching tipos distribution:", error)
        return { success: false, error: "Error al obtener distribución de tipos" }
    }
}

// Obtener distribución de estados de pago
export async function getEstadosPagoDistribution() {
    try {
        console.log("📊 Obteniendo distribución de estados de pago...")

        const result = await db
            .select({
                estado: catEstadosPago.nombreEstado,
                count: count(),
            })
            .from(tramites)
            .leftJoin(catEstadosPago, eq(tramites.estadoPagoId, catEstadosPago.id))
            .where(isNull(tramites.fechaEliminacion))
            .groupBy(catEstadosPago.nombreEstado)
            .orderBy(desc(count()))

        console.log("✅ Distribución de pagos obtenida:", result.length)
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching pagos distribution:", error)
        return { success: false, error: "Error al obtener distribución de pagos" }
    }
}

// Obtener actividad reciente
export async function getActividadReciente() {
    try {
        console.log("📊 Obteniendo actividad reciente...")

        // Trámites creados recientemente
        const tramitesRecientes = await db
            .select({
                id: tramites.id,
                fechaCreacion: tramites.fechaCreacion,
                clienteNombres: clientes.nombres,
                clienteApellidos: clientes.apellidos,
                tipoTramite: catTiposTramite.nombreTipo,
                estadoProceso: catEstadosProceso.nombreEstado,
            })
            .from(tramites)
            .leftJoin(clientes, eq(tramites.clienteId, clientes.id))
            .leftJoin(catTiposTramite, eq(tramites.tipoTramiteId, catTiposTramite.id))
            .leftJoin(catEstadosProceso, eq(tramites.estadoProcesoId, catEstadosProceso.id))
            .where(isNull(tramites.fechaEliminacion))
            .orderBy(desc(tramites.fechaCreacion))
            .limit(10)

        // Clientes registrados recientemente
        const clientesRecientes = await db
            .select({
                id: clientes.id,
                nombres: clientes.nombres,
                apellidos: clientes.apellidos,
                email: clientes.email,
                fechaCreacion: clientes.fechaCreacion,
            })
            .from(clientes)
            .where(isNull(clientes.fechaEliminacion))
            .orderBy(desc(clientes.fechaCreacion))
            .limit(5)

        const actividad = {
            tramitesRecientes,
            clientesRecientes,
        }

        console.log("✅ Actividad reciente obtenida")
        return { success: true, data: actividad }
    } catch (error) {
        console.error("❌ Error fetching actividad reciente:", error)
        return { success: false, error: "Error al obtener actividad reciente" }
    }
}

// Obtener trámites por usuario asignado
export async function getTramitesPorUsuario() {
    try {
        console.log("📊 Obteniendo trámites por usuario...")

        const result = await db
            .select({
                usuario: usuarios.nombreCompleto,
                count: count(),
            })
            .from(tramites)
            .leftJoin(usuarios, eq(tramites.usuarioAsignadoId, usuarios.id))
            .where(isNull(tramites.fechaEliminacion))
            .groupBy(usuarios.nombreCompleto)
            .orderBy(desc(count()))

        // Agregar trámites sin asignar
        const sinAsignar = await db
            .select({ count: count() })
            .from(tramites)
            .where(sql`${tramites.fechaEliminacion} IS NULL AND ${tramites.usuarioAsignadoId} IS NULL`)

        const resultWithUnassigned = [
            ...result,
            ...(sinAsignar[0]?.count > 0 ? [{ usuario: "Sin asignar", count: sinAsignar[0].count }] : []),
        ]

        console.log("✅ Trámites por usuario obtenidos:", resultWithUnassigned.length)
        return { success: true, data: resultWithUnassigned }
    } catch (error) {
        console.error("❌ Error fetching tramites por usuario:", error)
        return { success: false, error: "Error al obtener trámites por usuario" }
    }
}

// Obtener métricas de rendimiento mensual
export async function getMetricasMensuales() {
    try {
        console.log("📊 Obteniendo métricas mensuales...")

        // Trámites creados por mes (últimos 6 meses)
        const tramitesPorMes = await db
            .select({
                mes: sql<string>`TO_CHAR(${tramites.fechaCreacion}, 'YYYY-MM')`,
                count: count(),
            })
            .from(tramites)
            .where(sql`${tramites.fechaEliminacion} IS NULL AND ${tramites.fechaCreacion} >= NOW() - INTERVAL '6 months'`)
            .groupBy(sql`TO_CHAR(${tramites.fechaCreacion}, 'YYYY-MM')`)
            .orderBy(sql`TO_CHAR(${tramites.fechaCreacion}, 'YYYY-MM')`)

        // Clientes registrados por mes (últimos 6 meses)
        const clientesPorMes = await db
            .select({
                mes: sql<string>`TO_CHAR(${clientes.fechaCreacion}, 'YYYY-MM')`,
                count: count(),
            })
            .from(clientes)
            .where(sql`${clientes.fechaEliminacion} IS NULL AND ${clientes.fechaCreacion} >= NOW() - INTERVAL '6 months'`)
            .groupBy(sql`TO_CHAR(${clientes.fechaCreacion}, 'YYYY-MM')`)
            .orderBy(sql`TO_CHAR(${clientes.fechaCreacion}, 'YYYY-MM')`)

        const metricas = {
            tramitesPorMes,
            clientesPorMes,
        }

        console.log("✅ Métricas mensuales obtenidas")
        return { success: true, data: metricas }
    } catch (error) {
        console.error("❌ Error fetching métricas mensuales:", error)
        return { success: false, error: "Error al obtener métricas mensuales" }
    }
}
