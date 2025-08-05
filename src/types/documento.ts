// Tipos base del esquema
export interface Documento {
    id: number
    tramiteId: number
    tipoDocumentoId: number
    nombreDocumento: string
    rutaArchivo: string
    fechaCreacion: Date
    fechaModificacion: Date
    fechaEliminacion: Date | null
    // Relaciones
    tramite?: {
        id: number
        cliente?: {
            id: number
            nombres: string
            apellidos: string
            email: string | null
            telefonoCelular: string | null
        }
        tipoTramite?: {
            id: number
            nombreTipo: string
        }
    } | null
    tipoDocumento?: {
        id: number
        nombreTipo: string
    } | null
}

export interface CreateDocumentoData {
    tramiteId: number
    tipoDocumentoId: number
    nombreDocumento: string
    rutaArchivo: string
}

export interface UpdateDocumentoData {
    id: number
    tramiteId?: number
    tipoDocumentoId?: number
    nombreDocumento?: string
    rutaArchivo?: string
}

export interface TipoDocumento {
    id: number
    nombreTipo: string
}

export interface DocumentoFilters {
    tramiteId?: number
    tipoDocumentoId?: number
    fechaDesde?: string
    fechaHasta?: string
}

export interface DocumentoUploadFormProps {
    onSuccess: () => void
    onCancel: () => void
    defaultTramiteId?: number
}
