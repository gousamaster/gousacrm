"use server"

import { db } from "@/lib/db"
import { documentos, tramites, clientes, catTiposDocumento, catTiposTramite } from "@/lib/db/schema"
import { eq, isNull, and, desc, gte, lte, ilike, or, type SQL, count } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type { CreateDocumentoData, UpdateDocumentoData, Documento, DocumentoFilters } from "@/types/documento"
import { uploadFileToSupabase, deleteFileFromSupabase, getFileUrl } from "@/lib/supabase-storage"

// Obtener todos los documentos con relaciones
export async function getDocumentos(filters?: DocumentoFilters) {
    try {
        console.log("🔍 Buscando documentos...", filters)

        // Construir condiciones
        const conditions: SQL<unknown>[] = [isNull(documentos.fechaEliminacion)]

        // Aplicar filtros
        if (filters?.tramiteId) {
            conditions.push(eq(documentos.tramiteId, filters.tramiteId))
        }
        if (filters?.tipoDocumentoId) {
            conditions.push(eq(documentos.tipoDocumentoId, filters.tipoDocumentoId))
        }
        if (filters?.fechaDesde) {
            conditions.push(gte(documentos.fechaCreacion, new Date(filters.fechaDesde)))
        }
        if (filters?.fechaHasta) {
            conditions.push(lte(documentos.fechaCreacion, new Date(filters.fechaHasta)))
        }

        const whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions)

        // Query con todas las relaciones
        const rawResult = await db
            .select({
                // Campos de documento
                id: documentos.id,
                tramiteId: documentos.tramiteId,
                tipoDocumentoId: documentos.tipoDocumentoId,
                nombreDocumento: documentos.nombreDocumento,
                rutaArchivo: documentos.rutaArchivo,
                fechaCreacion: documentos.fechaCreacion,
                fechaModificacion: documentos.fechaModificacion,
                fechaEliminacion: documentos.fechaEliminacion,
                // Relaciones
                tramiteId_rel: tramites.id,
                clienteId: clientes.id,
                clienteNombres: clientes.nombres,
                clienteApellidos: clientes.apellidos,
                clienteEmail: clientes.email,
                clienteTelefonoCelular: clientes.telefonoCelular,
                tipoTramiteId: catTiposTramite.id,
                tipoTramiteNombre: catTiposTramite.nombreTipo,
                tipoDocumentoId_rel: catTiposDocumento.id,
                tipoDocumentoNombre: catTiposDocumento.nombreTipo,
            })
            .from(documentos)
            .leftJoin(tramites, eq(documentos.tramiteId, tramites.id))
            .leftJoin(clientes, eq(tramites.clienteId, clientes.id))
            .leftJoin(catTiposTramite, eq(tramites.tipoTramiteId, catTiposTramite.id))
            .leftJoin(catTiposDocumento, eq(documentos.tipoDocumentoId, catTiposDocumento.id))
            .where(whereCondition)
            .orderBy(desc(documentos.fechaCreacion))

        // Transformar el resultado
        const result: Documento[] = rawResult.map((row) => ({
            id: row.id,
            tramiteId: row.tramiteId,
            tipoDocumentoId: row.tipoDocumentoId,
            nombreDocumento: row.nombreDocumento,
            rutaArchivo: row.rutaArchivo,
            fechaCreacion: row.fechaCreacion,
            fechaModificacion: row.fechaModificacion,
            fechaEliminacion: row.fechaEliminacion,
            // Construir objetos de relación
            tramite: row.tramiteId_rel
                ? {
                    id: row.tramiteId_rel,
                    cliente: row.clienteId
                        ? {
                            id: row.clienteId,
                            nombres: row.clienteNombres!,
                            apellidos: row.clienteApellidos!,
                            email: row.clienteEmail,
                            telefonoCelular: row.clienteTelefonoCelular,
                        }
                        : undefined,
                    tipoTramite: row.tipoTramiteId
                        ? {
                            id: row.tipoTramiteId,
                            nombreTipo: row.tipoTramiteNombre!,
                        }
                        : undefined,
                }
                : null,
            tipoDocumento: row.tipoDocumentoId_rel
                ? {
                    id: row.tipoDocumentoId_rel,
                    nombreTipo: row.tipoDocumentoNombre!,
                }
                : null,
        }))

        console.log("✅ Documentos encontrados:", result.length)
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching documentos:", error)
        return {
            success: false,
            error: `Error al obtener los documentos: ${error instanceof Error ? error.message : "Error desconocido"}`,
        }
    }
}

// Subir archivo y crear documento usando S3
export async function uploadDocumento(formData: FormData) {
    try {
        console.log("📤 Iniciando subida de documento...")

        const file = formData.get("file") as File
        const tramiteId = formData.get("tramiteId") as string
        const tipoDocumentoId = formData.get("tipoDocumentoId") as string

        console.log("📋 Datos recibidos:", {
            fileName: file?.name,
            fileSize: file?.size,
            tramiteId,
            tipoDocumentoId,
        })

        if (!file) {
            console.error("❌ No se proporcionó ningún archivo")
            return { success: false, error: "No se proporcionó ningún archivo" }
        }

        if (!tramiteId) {
            console.error("❌ El trámite es requerido")
            return { success: false, error: "El trámite es requerido" }
        }

        if (!tipoDocumentoId) {
            console.error("❌ El tipo de documento es requerido")
            return { success: false, error: "El tipo de documento es requerido" }
        }

        // Validar tipo de archivo
        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/gif",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ]

        if (!allowedTypes.includes(file.type)) {
            console.error("❌ Tipo de archivo no permitido:", file.type)
            return { success: false, error: `Tipo de archivo no permitido: ${file.type}` }
        }

        // Validar tamaño (10MB máximo)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
            console.error("❌ Archivo demasiado grande:", file.size)
            return { success: false, error: "El archivo es demasiado grande (máximo 10MB)" }
        }

        console.log("📤 Subiendo archivo a S3...")

        // Subir archivo a S3
        const uploadResult = await uploadFileToSupabase(file, "documentos", "uploads")

        if (!uploadResult.success) {
            console.error("❌ Error en la subida:", uploadResult.error)
            return { success: false, error: uploadResult.error }
        }

        console.log("✅ Archivo subido exitosamente, creando registro en BD...")

        // Crear registro en base de datos
        const documentoData: CreateDocumentoData = {
            tramiteId: Number.parseInt(tramiteId),
            tipoDocumentoId: Number.parseInt(tipoDocumentoId),
            nombreDocumento: file.name,
            rutaArchivo: uploadResult.data!.path,
        }

        console.log("💾 Insertando en base de datos:", documentoData)

        const result = await db.insert(documentos).values(documentoData).returning()

        console.log("✅ Documento creado exitosamente:", result[0])

        revalidatePath("/protected/documentos")
        revalidatePath("/protected/tramites")

        return {
            success: true,
            data: {
                ...result[0],
                publicUrl: uploadResult.data!.publicUrl,
            },
        }
    } catch (error) {
        console.error("❌ Error completo uploading documento:", error)
        return {
            success: false,
            error: `Error al subir el documento: ${error instanceof Error ? error.message : "Error desconocido"}`,
        }
    }
}

// Actualizar documento
export async function updateDocumento(data: UpdateDocumentoData) {
    try {
        console.log("📝 Actualizando documento:", data.id)

        const { id, ...updateData } = data

        // Procesar datos
        const processedData = {
            ...updateData,
            fechaModificacion: new Date(),
        }

        // Remover campos undefined
        const cleanedData = Object.fromEntries(Object.entries(processedData).filter(([_, value]) => value !== undefined))

        const result = await db.update(documentos).set(cleanedData).where(eq(documentos.id, id)).returning()

        console.log("✅ Documento actualizado:", result[0].id)
        revalidatePath("/protected/documentos")
        revalidatePath("/protected/tramites")
        return { success: true, data: result[0] }
    } catch (error) {
        console.error("❌ Error updating documento:", error)
        return {
            success: false,
            error: `Error al actualizar el documento: ${error instanceof Error ? error.message : "Error desconocido"}`,
        }
    }
}

// Eliminar documento (soft delete + eliminar de S3)
export async function deleteDocumento(id: number) {
    try {
        console.log("🗑️ Eliminando documento:", id)

        // Obtener información del documento antes de eliminarlo
        const documento = await db
            .select({ rutaArchivo: documentos.rutaArchivo })
            .from(documentos)
            .where(eq(documentos.id, id))
            .limit(1)

        if (documento.length === 0) {
            return { success: false, error: "Documento no encontrado" }
        }

        // Soft delete en base de datos
        await db
            .update(documentos)
            .set({
                fechaEliminacion: new Date(),
                fechaModificacion: new Date(),
            })
            .where(eq(documentos.id, id))

        // Eliminar archivo de S3
        const deleteResult = await deleteFileFromSupabase(documento[0].rutaArchivo)
        if (!deleteResult.success) {
            console.warn("⚠️ No se pudo eliminar el archivo de S3:", deleteResult.error)
            // No fallar la operación completa si no se puede eliminar el archivo
        }

        console.log("✅ Documento eliminado:", id)
        revalidatePath("/protected/documentos")
        revalidatePath("/protected/tramites")
        return { success: true }
    } catch (error) {
        console.error("❌ Error deleting documento:", error)
        return {
            success: false,
            error: `Error al eliminar el documento: ${error instanceof Error ? error.message : "Error desconocido"}`,
        }
    }
}

// Obtener tipos de documento para el formulario
export async function getTiposDocumento() {
    try {
        const result = await db.select().from(catTiposDocumento).orderBy(catTiposDocumento.nombreTipo)
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error fetching tipos documento:", error)
        return { success: false, error: "Error al obtener tipos de documento" }
    }
}

// Obtener estadísticas de documentos
export async function getDocumentosStats() {
    try {
        console.log("📊 Obteniendo estadísticas de documentos...")

        const [totalDocs] = await Promise.all([
            // Total de documentos activos
            db
                .select({ count: count() })
                .from(documentos)
                .where(isNull(documentos.fechaEliminacion)),
        ])

        const stats = {
            totalDocumentos: totalDocs[0]?.count || 0,
            documentosPendientes: 0, // No hay campo estado en tu esquema
            documentosAprobados: 0,
            documentosRechazados: 0,
        }

        console.log("✅ Estadísticas de documentos obtenidas:", stats)
        return { success: true, data: stats }
    } catch (error) {
        console.error("❌ Error fetching documentos stats:", error)
        return { success: false, error: "Error al obtener estadísticas de documentos" }
    }
}

// Buscar documentos
export async function searchDocumentos(searchTerm: string) {
    try {
        console.log("🔍 Buscando documentos:", searchTerm)

        if (!searchTerm.trim()) {
            return getDocumentos()
        }

        const searchPattern = `%${searchTerm.trim()}%`
        const conditions = [
            isNull(documentos.fechaEliminacion),
            or(
                ilike(documentos.nombreDocumento, searchPattern),
                ilike(clientes.nombres, searchPattern),
                ilike(clientes.apellidos, searchPattern),
                ilike(catTiposDocumento.nombreTipo, searchPattern),
            ),
        ]

        const whereCondition = and(...conditions)

        const rawResult = await db
            .select({
                id: documentos.id,
                tramiteId: documentos.tramiteId,
                tipoDocumentoId: documentos.tipoDocumentoId,
                nombreDocumento: documentos.nombreDocumento,
                rutaArchivo: documentos.rutaArchivo,
                fechaCreacion: documentos.fechaCreacion,
                fechaModificacion: documentos.fechaModificacion,
                fechaEliminacion: documentos.fechaEliminacion,
                clienteId: clientes.id,
                clienteNombres: clientes.nombres,
                clienteApellidos: clientes.apellidos,
                clienteEmail: clientes.email,
                clienteTelefonoCelular: clientes.telefonoCelular,
                tipoDocumentoNombre: catTiposDocumento.nombreTipo,
            })
            .from(documentos)
            .leftJoin(tramites, eq(documentos.tramiteId, tramites.id))
            .leftJoin(clientes, eq(tramites.clienteId, clientes.id))
            .leftJoin(catTiposDocumento, eq(documentos.tipoDocumentoId, catTiposDocumento.id))
            .where(whereCondition)
            .orderBy(desc(documentos.fechaCreacion))

        const result: Documento[] = rawResult.map((row) => ({
            id: row.id,
            tramiteId: row.tramiteId,
            tipoDocumentoId: row.tipoDocumentoId,
            nombreDocumento: row.nombreDocumento,
            rutaArchivo: row.rutaArchivo,
            fechaCreacion: row.fechaCreacion,
            fechaModificacion: row.fechaModificacion,
            fechaEliminacion: row.fechaEliminacion,
            tramite: row.clienteNombres
                ? {
                    id: row.tramiteId,
                    cliente: row.clienteId
                        ? {
                            id: row.clienteId,
                            nombres: row.clienteNombres,
                            apellidos: row.clienteApellidos!,
                            email: row.clienteEmail,
                            telefonoCelular: row.clienteTelefonoCelular,
                        }
                        : undefined,
                    tipoTramite: undefined,
                }
                : null,
            tipoDocumento: row.tipoDocumentoNombre
                ? {
                    id: row.tipoDocumentoId,
                    nombreTipo: row.tipoDocumentoNombre,
                }
                : null,
        }))

        console.log("✅ Documentos encontrados en búsqueda:", result.length)
        return { success: true, data: result }
    } catch (error) {
        console.error("❌ Error searching documentos:", error)
        return { success: false, error: "Error en la búsqueda de documentos" }
    }
}

// Obtener documentos de un trámite específico
export async function getDocumentosByTramite(tramiteId: number) {
    try {
        console.log("📄 Obteniendo documentos del trámite:", tramiteId)

        return await getDocumentos({ tramiteId })
    } catch (error) {
        console.error("❌ Error fetching documentos by tramite:", error)
        return { success: false, error: "Error al obtener documentos del trámite" }
    }
}

// Obtener URL pública de un documento
export async function getDocumentoUrl(rutaArchivo: string) {
    try {
        const url = getFileUrl(rutaArchivo)
        return { success: true, url }
    } catch (error) {
        console.error("❌ Error getting documento URL:", error)
        return { success: false, error: "Error al obtener URL del documento" }
    }
}
