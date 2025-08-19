"use server"

import { db } from "@/lib/db"
import { serviciosComplementarios, clientes, catTiposServicio, usuarios } from "@/lib/db/schema"
import { eq, isNull, and, desc, gte, lte, ilike, or, type SQL, count } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type {
    CreateServicioComplementarioData,
    UpdateServicioComplementarioData,
    ServicioComplementario,
    ServicioComplementarioFilters
} from "@/types/servicio-complementario"

// Obtener todos los servicios complementarios con relaciones
export async function getServiciosComplementarios(filters?: ServicioComplementarioFilters) {
    try {
        console.log("🔍 Buscando servicios complementarios...", filters)

        // Construir condiciones
        const conditions: SQL<unknown>[] = [isNull(serviciosComplementarios.fechaEliminacion)]

        // Aplicar filtros
        if (filters?.clienteId) {
            conditions.push(eq(serviciosComplementarios.clienteId, filters.clienteId))
        }
        if (filters?.tipoServicioId) {
            conditions.push(eq(serviciosComplementarios.tipoServicioId, filters.tipoServicioId))
        }
        if (filters?.usuarioResponsableId) {
            conditions.push(eq(serviciosComplementarios.usuarioResponsableId, filters.usuarioResponsableId))
        }
        if (filters?.fechaDesde) {
            conditions.push(gte(serviciosComplementarios.fechaCreacion, new Date(filters.fechaDesde)))
        }
        if (filters?.fechaHasta) {
            conditions.push(lte(serviciosComplementarios.fechaCreacion, new Date(filters.fechaHasta)))
        }

        const whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions)

        // Query con todas las relaciones
        const rawResult = await db
            .select({
                // Campos del servicio complementario
                id: serviciosComplementarios.id,
                clienteId: serviciosComplementarios.clienteId,
                usuarioResponsableId: serviciosComplementarios.usuarioResponsableId,
                tipoServicioId: serviciosComplementarios.tipoServicioId,
                descripcion: serviciosComplementarios.descripcion,
                fechaInicioServicio: serviciosComplementarios.fechaInicioServicio,
                fechaFinServicio: serviciosComplementarios.fechaFinServicio,
                fechaCreacion: serviciosComplementarios.fechaCreacion,
                fechaModificacion: serviciosComplementarios.fechaModificacion,
                fechaEliminacion: serviciosComplementarios.fechaEliminacion,
                // Relaciones
                clienteNombres: clientes.nombres,
                clienteApellidos: clientes.apellidos,
                clienteEmail: clientes.email,
                clienteTelefonoCelular: clientes.telefonoCelular,
                usuarioNombre: usuarios.nombreCompleto,
                usuarioEmail: usuarios.email,
                tipoServicioNombre: catTiposServicio.nombreServicio,
            })
            .from(serviciosComplementarios)
            .leftJoin(clientes, eq(serviciosComplementarios.clienteId, clientes.id))
            .leftJoin(usuarios, eq(serviciosComplementarios.usuarioResponsableId, usuarios.id))
            .leftJoin(catTiposServicio, eq(serviciosComplementarios.tipoServicioId, catTiposServicio.id))
            .where(whereCondition)
            .orderBy(desc(serviciosComplementarios.fechaCreacion))

        // Transformar el resultado
        const result: ServicioComplementario[] = rawResult.map((row) => ({
            id: row.id,
            clienteId: row.clienteId,
            usuarioResponsableId: row.usuarioResponsableId,
            tipoServicioId: row.tipoServicioId,
            descripcion: row.descripcion,
            fechaInicioServicio: row.fechaInicioServicio,
            fechaFinServicio: row.fechaFinServicio,
            fechaCreacion: row.fechaCreacion,
            fechaModificacion: row.fechaModificacion,
            fechaEliminacion: row.fechaEliminacion,
            // Construir objetos de relación
            cliente: {
                id: row.clienteId,
                nombres: row.clienteNombres!,
                apellidos: row.clienteApellidos!,
                email: row.clienteEmail,
                telefonoCelular: row.clienteTelefonoCelular,
            },
            usuarioResponsable: row.usuarioNombre
                ? {
                    id: row.usuarioResponsableId!,
                    nombreCompleto: row.usuarioNombre,
                    email: row.usuarioEmail!,
                }
                : null,
            tipoServicio: {
                id: row.tipoServicioId,
                nombreServicio: row.tipoServicioNombre!,
            },
        }))

        console.log("✅ Servicios complementarios encontrados:", result.length)
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching servicios complementarios:", error)
        return {
            success: false,
            error: `Error al obtener los servicios complementarios: ${error instanceof Error ? error.message : "Error desconocido"}`,
        }
    }
}

// Crear nuevo servicio complementario
export async function createServicioComplementario(data: CreateServicioComplementarioData) {
    try {
        console.log("➕ Creando servicio complementario:", data)

        const result = await db.insert(serviciosComplementarios).values(data).returning()

        console.log("✅ Servicio complementario creado:", result[0].id)
        revalidatePath("/protected/servicios-complementarios")
        return { success: true, data: result[0] }
    } catch (error) {
        console.error("❌ Error creating servicio complementario:", error)
        return {
            success: false,
            error: `Error al crear el servicio complementario: ${error instanceof Error ? error.message : "Error desconocido"}`,
        }
    }
}

// Actualizar servicio complementario
export async function updateServicioComplementario(data: UpdateServicioComplementarioData) {
    try {
        console.log("📝 Actualizando servicio complementario:", data.id)

        const { id, ...updateData } = data

        // Procesar datos
        const processedData = {
            ...updateData,
            fechaInicioServicio: updateData.fechaInicioServicio ? new Date(updateData.fechaInicioServicio) : undefined,
            fechaFinServicio: updateData.fechaFinServicio ? new Date(updateData.fechaFinServicio) : undefined,
            fechaModificacion: new Date(),
        }

        // Remover campos undefined
        const cleanedData = Object.fromEntries(Object.entries(processedData).filter(([_, value]) => value !== undefined))

        const result = await db
            .update(serviciosComplementarios)
            .set(cleanedData)
            .where(eq(serviciosComplementarios.id, id))
            .returning()

        console.log("✅ Servicio complementario actualizado:", result[0].id)
        revalidatePath("/protected/servicios-complementarios")
        return { success: true, data: result[0] }
    } catch (error) {
        console.error("❌ Error updating servicio complementario:", error)
        return {
            success: false,
            error: `Error al actualizar el servicio complementario: ${error instanceof Error ? error.message : "Error desconocido"}`,
        }
    }
}

// Eliminar servicio complementario (soft delete)
export async function deleteServicioComplementario(id: number) {
    try {
        console.log("🗑️ Eliminando servicio complementario:", id)

        await db
            .update(serviciosComplementarios)
            .set({
                fechaEliminacion: new Date(),
                fechaModificacion: new Date(),
            })
            .where(eq(serviciosComplementarios.id, id))

        console.log("✅ Servicio complementario eliminado:", id)
        revalidatePath("/protected/servicios-complementarios")
        return { success: true }
    } catch (error) {
        console.error("❌ Error deleting servicio complementario:", error)
        return {
            success: false,
            error: `Error al eliminar el servicio complementario: ${error instanceof Error ? error.message : "Error desconocido"}`,
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

// Obtener servicios para select
export async function getServiciosComplementariosForSelect() {
    try {
        const result = await db
            .select({
                id: serviciosComplementarios.id,
                clienteNombres: clientes.nombres,
                clienteApellidos: clientes.apellidos,
                tipoServicio: catTiposServicio.nombreServicio,
            })
            .from(serviciosComplementarios)
            .leftJoin(clientes, eq(serviciosComplementarios.clienteId, clientes.id))
            .leftJoin(catTiposServicio, eq(serviciosComplementarios.tipoServicioId, catTiposServicio.id))
            .where(isNull(serviciosComplementarios.fechaEliminacion))
            .orderBy(desc(serviciosComplementarios.fechaCreacion))

        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching servicios for select:", error)
        return { success: false, error: "Error al obtener servicios complementarios" }
    }
}

// Obtener tipos de servicio para el formulario
export async function getTiposServicio() {
    try {
        const result = await db.select().from(catTiposServicio).orderBy(catTiposServicio.nombreServicio)
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching tipos servicio:", error)
        return { success: false, error: "Error al obtener tipos de servicio" }
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

// Obtener estadísticas de servicios complementarios
export async function getServiciosComplementariosStats() {
    try {
        console.log("📊 Obteniendo estadísticas de servicios complementarios...")

        const [totalServicios, serviciosActivos, serviciosEsteAno, serviciosEsteMes] = await Promise.all([
            // Total de servicios activos
            db
                .select({ count: count() })
                .from(serviciosComplementarios)
                .where(isNull(serviciosComplementarios.fechaEliminacion)),

            // Servicios con fecha de fin posterior a hoy
            db
                .select({ count: count() })
                .from(serviciosComplementarios)
                .where(
                    and(
                        isNull(serviciosComplementarios.fechaEliminacion),
                        or(
                            isNull(serviciosComplementarios.fechaFinServicio),
                            gte(serviciosComplementarios.fechaFinServicio, new Date().toISOString().slice(0, 10))
                        )
                    )
                ),

            // Servicios creados este año
            db
                .select({ count: count() })
                .from(serviciosComplementarios)
                .where(
                    and(
                        isNull(serviciosComplementarios.fechaEliminacion),
                        gte(serviciosComplementarios.fechaCreacion, new Date(new Date().getFullYear(), 0, 1))
                    )
                ),

            // Servicios creados este mes
            db
                .select({ count: count() })
                .from(serviciosComplementarios)
                .where(
                    and(
                        isNull(serviciosComplementarios.fechaEliminacion),
                        gte(serviciosComplementarios.fechaCreacion, new Date(new Date().getFullYear(), new Date().getMonth(), 1))
                    )
                ),
        ])

        const stats = {
            totalServicios: totalServicios[0]?.count || 0,
            serviciosActivos: serviciosActivos[0]?.count || 0,
            serviciosEsteAno: serviciosEsteAno[0]?.count || 0,
            serviciosEsteMes: serviciosEsteMes[0]?.count || 0,
        }

        console.log("✅ Estadísticas de servicios complementarios obtenidas:", stats)
        return { success: true, data: stats }
    } catch (error) {
        console.error("❌ Error fetching servicios complementarios stats:", error)
        return { success: false, error: "Error al obtener estadísticas de servicios complementarios" }
    }
}

// Buscar servicios complementarios
export async function searchServiciosComplementarios(searchTerm: string) {
    try {
        console.log("🔍 Buscando servicios complementarios:", searchTerm)

        if (!searchTerm.trim()) {
            return getServiciosComplementarios()
        }

        const searchPattern = `%${searchTerm.trim()}%`
        const conditions = [
            isNull(serviciosComplementarios.fechaEliminacion),
            or(
                ilike(clientes.nombres, searchPattern),
                ilike(clientes.apellidos, searchPattern),
                ilike(serviciosComplementarios.descripcion, searchPattern),
                ilike(catTiposServicio.nombreServicio, searchPattern),
            ),
        ]

        const whereCondition = and(...conditions)

        const rawResult = await db
            .select({
                id: serviciosComplementarios.id,
                clienteId: serviciosComplementarios.clienteId,
                usuarioResponsableId: serviciosComplementarios.usuarioResponsableId,
                tipoServicioId: serviciosComplementarios.tipoServicioId,
                descripcion: serviciosComplementarios.descripcion,
                fechaInicioServicio: serviciosComplementarios.fechaInicioServicio,
                fechaFinServicio: serviciosComplementarios.fechaFinServicio,
                fechaCreacion: serviciosComplementarios.fechaCreacion,
                fechaModificacion: serviciosComplementarios.fechaModificacion,
                fechaEliminacion: serviciosComplementarios.fechaEliminacion,
                clienteNombres: clientes.nombres,
                clienteApellidos: clientes.apellidos,
                clienteEmail: clientes.email,
                clienteTelefonoCelular: clientes.telefonoCelular,
                usuarioNombre: usuarios.nombreCompleto,
                usuarioEmail: usuarios.email,
                tipoServicioNombre: catTiposServicio.nombreServicio,
            })
            .from(serviciosComplementarios)
            .leftJoin(clientes, eq(serviciosComplementarios.clienteId, clientes.id))
            .leftJoin(usuarios, eq(serviciosComplementarios.usuarioResponsableId, usuarios.id))
            .leftJoin(catTiposServicio, eq(serviciosComplementarios.tipoServicioId, catTiposServicio.id))
            .where(whereCondition)
            .orderBy(desc(serviciosComplementarios.fechaCreacion))

        const result: ServicioComplementario[] = rawResult.map((row) => ({
            id: row.id,
            clienteId: row.clienteId,
            usuarioResponsableId: row.usuarioResponsableId,
            tipoServicioId: row.tipoServicioId,
            descripcion: row.descripcion,
            fechaInicioServicio: row.fechaInicioServicio,
            fechaFinServicio: row.fechaFinServicio,
            fechaCreacion: row.fechaCreacion,
            fechaModificacion: row.fechaModificacion,
            fechaEliminacion: row.fechaEliminacion,
            cliente: {
                id: row.clienteId,
                nombres: row.clienteNombres!,
                apellidos: row.clienteApellidos!,
                email: row.clienteEmail,
                telefonoCelular: row.clienteTelefonoCelular,
            },
            usuarioResponsable: row.usuarioNombre
                ? {
                    id: row.usuarioResponsableId!,
                    nombreCompleto: row.usuarioNombre,
                    email: row.usuarioEmail!,
                }
                : null,
            tipoServicio: {
                id: row.tipoServicioId,
                nombreServicio: row.tipoServicioNombre!,
            },
        }))

        console.log("✅ Servicios complementarios encontrados en búsqueda:", result.length)
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error searching servicios complementarios:", error)
        return { success: false, error: "Error en la búsqueda de servicios complementarios" }
    }
}