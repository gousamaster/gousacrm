"use server"

import { db } from "@/lib/db"
import {
    tramites,
    clientes,
    usuarios,
    catTiposTramite,
    catEstadosProceso,
    catEstadosPago,
    citas,
    catTiposCita,
    serviciosComplementarios,
    catTiposServicio
} from "@/lib/db/schema"
import { eq, isNull, count, desc, sql, asc, and, gte, lte } from "drizzle-orm"

// Obtener estadísticas generales mejoradas
export async function getDashboardStats() {
    try {
        console.log("📊 Obteniendo estadísticas del dashboard...")

        const [
            clientesTotal,
            tramitesTotal,
            tramitesActivos,
            clientesRecientes,
            citasPendientes,
            serviciosActivos,
            tramitesCompletados,
            citasHoy
        ] = await Promise.all([
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

            // Citas pendientes (programadas)
            db
                .select({ count: count() })
                .from(citas)
                .where(
                    and(
                        isNull(citas.fechaEliminacion),
                        sql`${citas.estado} = 'Programada'`
                    )
                ),

            // Servicios complementarios activos
            db
                .select({ count: count() })
                .from(serviciosComplementarios)
                .where(
                    and(
                        isNull(serviciosComplementarios.fechaEliminacion),
                        sql`(${serviciosComplementarios.fechaFinServicio} IS NULL OR ${serviciosComplementarios.fechaFinServicio} >= NOW())`
                    )
                ),

            // Trámites completados
            db
                .select({ count: count() })
                .from(tramites)
                .leftJoin(catEstadosProceso, eq(tramites.estadoProcesoId, catEstadosProceso.id))
                .where(
                    sql`${tramites.fechaEliminacion} IS NULL AND LOWER(${catEstadosProceso.nombreEstado}) LIKE '%completado%'`,
                ),

            // Citas hoy
            db
                .select({ count: count() })
                .from(citas)
                .where(
                    and(
                        isNull(citas.fechaEliminacion),
                        sql`DATE(${citas.fechaHora}) = CURRENT_DATE`
                    )
                )
        ])

        const stats = {
            totalClientes: clientesTotal[0]?.count || 0,
            totalTramites: tramitesTotal[0]?.count || 0,
            tramitesActivos: tramitesActivos[0]?.count || 0,
            clientesRecientes: clientesRecientes[0]?.count || 0,
            citasPendientes: citasPendientes[0]?.count || 0,
            serviciosActivos: serviciosActivos[0]?.count || 0,
            tramitesCompletados: tramitesCompletados[0]?.count || 0,
            citasHoy: citasHoy[0]?.count || 0,
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

// Obtener próximas citas (próximos 7 días)
export async function getProximasCitas() {
    try {
        console.log("📅 Obteniendo próximas citas...")

        const result = await db
            .select({
                id: citas.id,
                fechaHora: citas.fechaHora,
                lugar: citas.lugar,
                estado: citas.estado,
                clienteNombres: clientes.nombres,
                clienteApellidos: clientes.apellidos,
                clienteEmail: clientes.email,
                tipoCita: catTiposCita.nombreTipo,
                tipoTramite: catTiposTramite.nombreTipo,
            })
            .from(citas)
            .leftJoin(tramites, eq(citas.tramiteId, tramites.id))
            .leftJoin(clientes, eq(tramites.clienteId, clientes.id))
            .leftJoin(catTiposCita, eq(citas.tipoCitaId, catTiposCita.id))
            .leftJoin(catTiposTramite, eq(tramites.tipoTramiteId, catTiposTramite.id))
            .where(
                and(
                    isNull(citas.fechaEliminacion),
                    sql`${citas.fechaHora} >= NOW()`,
                    sql`${citas.fechaHora} <= NOW() + INTERVAL '7 days'`,
                    sql`${citas.estado} = 'Programada'`
                )
            )
            .orderBy(asc(citas.fechaHora))
            .limit(5)

        console.log("✅ Próximas citas obtenidas:", result.length)
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching próximas citas:", error)
        return { success: false, error: "Error al obtener próximas citas" }
    }
}

// Obtener trámites iniciados recientemente (últimos 7 días)
export async function getTramitesRecientesIniciados() {
    try {
        console.log("🆕 Obteniendo trámites recientes iniciados...")

        const result = await db
            .select({
                id: tramites.id,
                fechaCreacion: tramites.fechaCreacion,
                clienteNombres: clientes.nombres,
                clienteApellidos: clientes.apellidos,
                clienteEmail: clientes.email,
                tipoTramite: catTiposTramite.nombreTipo,
                estadoProceso: catEstadosProceso.nombreEstado,
                usuarioAsignado: usuarios.nombreCompleto,
            })
            .from(tramites)
            .leftJoin(clientes, eq(tramites.clienteId, clientes.id))
            .leftJoin(catTiposTramite, eq(tramites.tipoTramiteId, catTiposTramite.id))
            .leftJoin(catEstadosProceso, eq(tramites.estadoProcesoId, catEstadosProceso.id))
            .leftJoin(usuarios, eq(tramites.usuarioAsignadoId, usuarios.id))
            .where(
                and(
                    isNull(tramites.fechaEliminacion),
                    sql`${tramites.fechaCreacion} >= NOW() - INTERVAL '7 days'`
                )
            )
            .orderBy(desc(tramites.fechaCreacion))
            .limit(5)

        console.log("✅ Trámites recientes iniciados obtenidos:", result.length)
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching trámites recientes:", error)
        return { success: false, error: "Error al obtener trámites recientes" }
    }
}

// Obtener trámites con citas lejanas (más de 60 días)
export async function getTramitesCitasLejanas() {
    try {
        console.log("⏰ Obteniendo trámites con citas lejanas...")

        const result = await db
            .select({
                tramiteId: tramites.id,
                citaId: citas.id,
                fechaCita: citas.fechaHora,
                clienteNombres: clientes.nombres,
                clienteApellidos: clientes.apellidos,
                tipoTramite: catTiposTramite.nombreTipo,
                tipoCita: catTiposCita.nombreTipo,
                diasRestantes: sql<number>`EXTRACT(days FROM ${citas.fechaHora} - NOW())`,
            })
            .from(citas)
            .leftJoin(tramites, eq(citas.tramiteId, tramites.id))
            .leftJoin(clientes, eq(tramites.clienteId, clientes.id))
            .leftJoin(catTiposTramite, eq(tramites.tipoTramiteId, catTiposTramite.id))
            .leftJoin(catTiposCita, eq(citas.tipoCitaId, catTiposCita.id))
            .where(
                and(
                    isNull(citas.fechaEliminacion),
                    isNull(tramites.fechaEliminacion),
                    sql`${citas.estado} = 'Programada'`,
                    sql`${citas.fechaHora} > NOW() + INTERVAL '60 days'`
                )
            )
            .orderBy(desc(sql`EXTRACT(days FROM ${citas.fechaHora} - NOW())`))
            .limit(5)

        console.log("✅ Trámites con citas lejanas obtenidos:", result.length)
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching citas lejanas:", error)
        return { success: false, error: "Error al obtener citas lejanas" }
    }
}

// Obtener próximos servicios complementarios (próximos 30 días)
export async function getProximosServiciosComplementarios() {
    try {
        console.log("🛎️ Obteniendo próximos servicios complementarios...")

        const result = await db
            .select({
                id: serviciosComplementarios.id,
                fechaInicioServicio: serviciosComplementarios.fechaInicioServicio,
                fechaFinServicio: serviciosComplementarios.fechaFinServicio,
                descripcion: serviciosComplementarios.descripcion,
                clienteNombres: clientes.nombres,
                clienteApellidos: clientes.apellidos,
                clienteEmail: clientes.email,
                tipoServicio: catTiposServicio.nombreServicio,
                usuarioResponsable: usuarios.nombreCompleto,
            })
            .from(serviciosComplementarios)
            .leftJoin(clientes, eq(serviciosComplementarios.clienteId, clientes.id))
            .leftJoin(catTiposServicio, eq(serviciosComplementarios.tipoServicioId, catTiposServicio.id))
            .leftJoin(usuarios, eq(serviciosComplementarios.usuarioResponsableId, usuarios.id))
            .where(
                and(
                    isNull(serviciosComplementarios.fechaEliminacion),
                    sql`${serviciosComplementarios.fechaInicioServicio} IS NOT NULL`,
                    sql`${serviciosComplementarios.fechaInicioServicio} >= NOW()`,
                    sql`${serviciosComplementarios.fechaInicioServicio} <= NOW() + INTERVAL '30 days'`
                )
            )
            .orderBy(asc(serviciosComplementarios.fechaInicioServicio))
            .limit(5)

        console.log("✅ Próximos servicios complementarios obtenidos:", result.length)
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching próximos servicios:", error)
        return { success: false, error: "Error al obtener próximos servicios" }
    }
}

// Obtener próximos cumpleaños (próximos 30 días)
export async function getProximosCumpleanos() {
    try {
        console.log("🎂 Obteniendo próximos cumpleaños...")

        const result = await db
            .select({
                id: clientes.id,
                nombres: clientes.nombres,
                apellidos: clientes.apellidos,
                email: clientes.email,
                fechaNacimiento: clientes.fechaNacimiento,
                diasRestantes: sql<number>`
                    CASE 
                        WHEN EXTRACT(month FROM ${clientes.fechaNacimiento}) = EXTRACT(month FROM NOW()) 
                             AND EXTRACT(day FROM ${clientes.fechaNacimiento}) >= EXTRACT(day FROM NOW())
                        THEN EXTRACT(day FROM ${clientes.fechaNacimiento}) - EXTRACT(day FROM NOW())
                        WHEN EXTRACT(month FROM ${clientes.fechaNacimiento}) > EXTRACT(month FROM NOW())
                        THEN DATE_PART('day', 
                             DATE(EXTRACT(year FROM NOW()) || '-' || EXTRACT(month FROM ${clientes.fechaNacimiento}) || '-' || EXTRACT(day FROM ${clientes.fechaNacimiento})) 
                             - CURRENT_DATE)
                        ELSE DATE_PART('day', 
                             DATE((EXTRACT(year FROM NOW()) + 1) || '-' || EXTRACT(month FROM ${clientes.fechaNacimiento}) || '-' || EXTRACT(day FROM ${clientes.fechaNacimiento})) 
                             - CURRENT_DATE)
                    END
                `,
            })
            .from(clientes)
            .where(
                and(
                    isNull(clientes.fechaEliminacion),
                    sql`${clientes.fechaNacimiento} IS NOT NULL`
                )
            )
            .having(
                sql`
                    CASE 
                        WHEN EXTRACT(month FROM ${clientes.fechaNacimiento}) = EXTRACT(month FROM NOW()) 
                             AND EXTRACT(day FROM ${clientes.fechaNacimiento}) >= EXTRACT(day FROM NOW())
                        THEN EXTRACT(day FROM ${clientes.fechaNacimiento}) - EXTRACT(day FROM NOW())
                        WHEN EXTRACT(month FROM ${clientes.fechaNacimiento}) > EXTRACT(month FROM NOW())
                        THEN DATE_PART('day', 
                             DATE(EXTRACT(year FROM NOW()) || '-' || EXTRACT(month FROM ${clientes.fechaNacimiento}) || '-' || EXTRACT(day FROM ${clientes.fechaNacimiento})) 
                             - CURRENT_DATE)
                        ELSE DATE_PART('day', 
                             DATE((EXTRACT(year FROM NOW()) + 1) || '-' || EXTRACT(month FROM ${clientes.fechaNacimiento}) || '-' || EXTRACT(day FROM ${clientes.fechaNacimiento})) 
                             - CURRENT_DATE)
                    END <= 30
                `
            )
            .orderBy(sql`
                CASE 
                    WHEN EXTRACT(month FROM ${clientes.fechaNacimiento}) = EXTRACT(month FROM NOW()) 
                         AND EXTRACT(day FROM ${clientes.fechaNacimiento}) >= EXTRACT(day FROM NOW())
                    THEN EXTRACT(day FROM ${clientes.fechaNacimiento}) - EXTRACT(day FROM NOW())
                    WHEN EXTRACT(month FROM ${clientes.fechaNacimiento}) > EXTRACT(month FROM NOW())
                    THEN DATE_PART('day', 
                         DATE(EXTRACT(year FROM NOW()) || '-' || EXTRACT(month FROM ${clientes.fechaNacimiento}) || '-' || EXTRACT(day FROM ${clientes.fechaNacimiento})) 
                         - CURRENT_DATE)
                    ELSE DATE_PART('day', 
                         DATE((EXTRACT(year FROM NOW()) + 1) || '-' || EXTRACT(month FROM ${clientes.fechaNacimiento}) || '-' || EXTRACT(day FROM ${clientes.fechaNacimiento})) 
                         - CURRENT_DATE)
                END ASC
            `)
            .limit(5)

        console.log("✅ Próximos cumpleaños obtenidos:", result.length)
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching próximos cumpleaños:", error)
        return { success: false, error: "Error al obtener próximos cumpleaños" }
    }
}

// Funciones existentes (mantenidas para compatibilidad)
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