// Tipos para el manejo de servicios complementarios basados en el schema de GO USA
export interface ServicioComplementario {
    id: number
    clienteId: number
    usuarioResponsableId?: string | null
    tipoServicioId: number
    descripcion?: string | null
    fechaInicioServicio?: string | null
    fechaFinServicio?: string | null
    fechaCreacion: Date
    fechaModificacion: Date
    fechaEliminacion?: Date | null

    // Relaciones (cuando se incluyan en las queries)
    cliente: {
        id: number
        nombres: string
        apellidos: string
        email: string | null
        telefonoCelular: string | null
    } | null
    usuarioResponsable: {
        id: string
        nombreCompleto: string
        email: string
    } | null
    tipoServicio: {
        id: number
        nombreServicio: string
    } | null
}

export interface CreateServicioComplementarioData {
    clienteId: number
    usuarioResponsableId?: string
    tipoServicioId: number
    descripcion?: string
    fechaInicioServicio?: string
    fechaFinServicio?: string
}

export interface UpdateServicioComplementarioData extends Partial<CreateServicioComplementarioData> {
    id: number
}

// Nuevo tipo para filtros de servicios
export interface ServicioComplementarioFilters {
    clienteId?: number
    tipoServicioId?: number
    usuarioResponsableId?: string
    fechaDesde?: string
    fechaHasta?: string
    searchTerm?: string
}

// Tipos para los catálogos
export interface TipoServicio {
    id: number
    nombreServicio: string
}

// Tipo para el selector de servicios
export interface ServicioComplementarioForSelect {
    id: number
    clienteNombres: string | null
    clienteApellidos: string | null
    tipoServicio: string | null
}