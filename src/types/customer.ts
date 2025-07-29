// Tipos para el manejo de clientes basados en el schema de GO USA
export interface Customer {
    id: number
    nombres: string
    apellidos: string
    fechaNacimiento?: string | null
    lugarNacimiento?: string | null
    numeroCi?: string | null
    numeroPasaporte?: string | null
    pasaporteFechaEmision?: string | null
    pasaporteFechaExpiracion?: string | null
    email?: string | null
    telefonoCelular?: string | null
    direccionDomicilio?: string | null
    estadoCivil?: string | null
    profesion?: string | null
    conyugeNombreCompleto?: string | null
    conyugeFechaNacimiento?: string | null
    conyugeLugarNacimiento?: string | null
    matrimonioFechaInicio?: string | null
    matrimonioFechaFin?: string | null
    fechaCreacion: Date
    fechaModificacion: Date
    fechaEliminacion?: Date | null
}

export interface CreateCustomerData {
    nombres: string
    apellidos: string
    fechaNacimiento?: string
    lugarNacimiento?: string
    numeroCi?: string
    numeroPasaporte?: string
    pasaporteFechaEmision?: string
    pasaporteFechaExpiracion?: string
    email?: string
    telefonoCelular?: string
    direccionDomicilio?: string
    estadoCivil?: string
    profesion?: string
    conyugeNombreCompleto?: string
    conyugeFechaNacimiento?: string
    conyugeLugarNacimiento?: string
    matrimonioFechaInicio?: string
    matrimonioFechaFin?: string
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
    id: number
}
