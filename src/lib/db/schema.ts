import {
    pgTable,
    serial,
    varchar,
    date,
    text,
    timestamp,
    integer,
    decimal,
    pgEnum,
    uuid,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ---- ENUMERACIONES (Tipos de datos personalizados para PostgreSQL) ----
// Usamos enums para listas de opciones fijas y sencillas, lo que es eficiente.
export const rolEnum = pgEnum('rol', ['administrador', 'secretaria']);
export const pagoCitaEnum = pgEnum('pago_cita_estado', ['Pendiente', 'Pagado']);
export const estadoCitaEnum = pgEnum('estado_cita', ['Programada', 'Completada', 'Cancelada', 'Reprogramada']);

// =================================================================
// TABLAS PRINCIPALES
// =================================================================

// Tabla para los usuarios del sistema (personal de GO USA)
export const usuarios = pgTable('usuarios', {
    id: uuid('id').primaryKey(),
    nombreCompleto: varchar('nombre_completo', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    rol: rolEnum('rol').notNull(),
    fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
    fechaModificacion: timestamp('fecha_modificacion').defaultNow().notNull(),
    fechaEliminacion: timestamp('fecha_eliminacion'),
});

// Tabla para los clientes finales de GO USA
export const clientes = pgTable('clientes', {
    id: serial('id').primaryKey(),
    nombres: varchar('nombres', { length: 255 }).notNull(),
    apellidos: varchar('apellidos', { length: 255 }).notNull(),
    fechaNacimiento: date('fecha_nacimiento'),
    lugarNacimiento: varchar('lugar_nacimiento', { length: 255 }),
    numeroCi: varchar('numero_ci', { length: 50 }).unique(),
    numeroPasaporte: varchar('numero_pasaporte', { length: 50 }).unique(),
    pasaporteFechaEmision: date('pasaporte_fecha_emision'),
    pasaporteFechaExpiracion: date('pasaporte_fecha_expiracion'),
    email: varchar('email', { length: 255 }),
    telefonoCelular: varchar('telefono_celular', { length: 50 }),
    direccionDomicilio: text('direccion_domicilio'),
    estadoCivil: varchar('estado_civil', { length: 50 }),
    profesion: varchar('profesion', { length: 255 }),
    conyugeNombreCompleto: varchar('conyuge_nombre_completo', { length: 255 }),
    conyugeFechaNacimiento: date('conyuge_fecha_nacimiento'),
    conyugeLugarNacimiento: varchar('conyuge_lugar_nacimiento', { length: 255 }),
    matrimonioFechaInicio: date('matrimonio_fecha_inicio'),
    matrimonioFechaFin: date('matrimonio_fecha_fin'),
    fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
    fechaModificacion: timestamp('fecha_modificacion').defaultNow().notNull(),
    fechaEliminacion: timestamp('fecha_eliminacion'),
});

// Tabla central para cada trámite de visa
export const tramites = pgTable('tramites', {
    id: serial('id').primaryKey(),
    clienteId: integer('cliente_id').references(() => clientes.id, { onDelete: 'restrict' }).notNull(),
    usuarioAsignadoId: uuid('usuario_asignado_id').references(() => usuarios.id, { onDelete: 'set null' }),
    tipoTramiteId: integer('tipo_tramite_id').references(() => catTiposTramite.id, { onDelete: 'restrict' }).notNull(),
    estadoProcesoId: integer('estado_proceso_id').references(() => catEstadosProceso.id, { onDelete: 'restrict' }).notNull(),
    estadoPagoId: integer('estado_pago_id').references(() => catEstadosPago.id, { onDelete: 'restrict' }).notNull(),
    codigoConfirmacionDs160: varchar('codigo_confirmacion_ds160', { length: 255 }),
    codigoSeguimientoCourier: varchar('codigo_seguimiento_courier', { length: 255 }),
    visaNumero: varchar('visa_numero', { length: 255 }),
    visaFechaEmision: date('visa_fecha_emision'),
    visaFechaExpiracion: date('visa_fecha_expiracion'),
    notas: text('notas'),
    fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
    fechaModificacion: timestamp('fecha_modificacion').defaultNow().notNull(),
    fechaEliminacion: timestamp('fecha_eliminacion'),
});

// Tabla para agendar entrevistas y simulacros
export const citas = pgTable('citas', {
    id: serial('id').primaryKey(),
    tramiteId: integer('tramite_id').references(() => tramites.id, { onDelete: 'cascade' }).notNull(),
    tipoCitaId: integer('tipo_cita_id').references(() => catTiposCita.id, { onDelete: 'restrict' }).notNull(),
    fechaHora: timestamp('fecha_hora').notNull(),
    lugar: varchar('lugar', { length: 255 }),
    costo: decimal('costo', { precision: 10, scale: 2 }).default('0.00'),
    estadoPagoCita: pagoCitaEnum('estado_pago_cita'),
    estado: estadoCitaEnum('estado'),
    notas: text('notas'),
    fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
    fechaModificacion: timestamp('fecha_modificacion').defaultNow().notNull(),
    fechaEliminacion: timestamp('fecha_eliminacion'),
});

// Tabla para almacenar referencias a archivos adjuntos
export const documentos = pgTable('documentos', {
    id: serial('id').primaryKey(),
    tramiteId: integer('tramite_id').references(() => tramites.id, { onDelete: 'cascade' }).notNull(),
    tipoDocumentoId: integer('tipo_documento_id').references(() => catTiposDocumento.id, { onDelete: 'restrict' }).notNull(),
    nombreDocumento: varchar('nombre_documento', { length: 255 }).notNull(),
    rutaArchivo: varchar('ruta_archivo', { length: 255 }).notNull(),
    fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
    fechaModificacion: timestamp('fecha_modificacion').defaultNow().notNull(),
    fechaEliminacion: timestamp('fecha_eliminacion'),
});

// Tabla para servicios adicionales (viajes, hoteles, etc.)
export const serviciosComplementarios = pgTable('servicios_complementarios', {
    id: serial('id').primaryKey(),
    clienteId: integer('cliente_id').references(() => clientes.id, { onDelete: 'cascade' }).notNull(),
    usuarioResponsableId: uuid('usuario_responsable_id').references(() => usuarios.id, { onDelete: 'set null' }),
    tipoServicioId: integer('tipo_servicio_id').references(() => catTiposServicio.id, { onDelete: 'restrict' }).notNull(),
    descripcion: text('descripcion'),
    fechaInicioServicio: date('fecha_inicio_servicio'),
    fechaFinServicio: date('fecha_fin_servicio'),
    fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
    fechaModificacion: timestamp('fecha_modificacion').defaultNow().notNull(),
    fechaEliminacion: timestamp('fecha_eliminacion'),
});

// Tabla de auditoría para rastrear cambios en los trámites
export const tramiteLogs = pgTable('tramite_logs', {
    id: serial('id').primaryKey(),
    tramiteId: integer('tramite_id').references(() => tramites.id, { onDelete: 'cascade' }).notNull(),
    usuarioId: uuid('usuario_id').references(() => usuarios.id, { onDelete: 'set null' }),
    accionRealizada: text('accion_realizada').notNull(),
    fechaAccion: timestamp('fecha_accion').defaultNow().notNull(),
});


// =================================================================
// TABLAS DE CATÁLOGO
// =================================================================

export const catTiposTramite = pgTable('cat_tipos_tramite', {
    id: serial('id').primaryKey(),
    nombreTipo: varchar('nombre_tipo', { length: 255 }).notNull().unique(),
});

export const catEstadosProceso = pgTable('cat_estados_proceso', {
    id: serial('id').primaryKey(),
    nombreEstado: varchar('nombre_estado', { length: 255 }).notNull().unique(),
});

export const catEstadosPago = pgTable('cat_estados_pago', {
    id: serial('id').primaryKey(),
    nombreEstado: varchar('nombre_estado', { length: 255 }).notNull().unique(),
});

export const catTiposCita = pgTable('cat_tipos_cita', {
    id: serial('id').primaryKey(),
    nombreTipo: varchar('nombre_tipo', { length: 255 }).notNull().unique(),
});

export const catTiposDocumento = pgTable('cat_tipos_documento', {
    id: serial('id').primaryKey(),
    nombreTipo: varchar('nombre_tipo', { length: 255 }).notNull().unique(),
});

export const catTiposServicio = pgTable('cat_tipos_servicio', {
    id: serial('id').primaryKey(),
    nombreServicio: varchar('nombre_servicio', { length: 255 }).notNull().unique(),
});


// =================================================================
// DEFINICIÓN DE RELACIONES
// =================================================================

export const usuariosRelations = relations(usuarios, ({ many }) => ({
    tramitesAsignados: many(tramites),
    serviciosGestionados: many(serviciosComplementarios),
    logsRealizados: many(tramiteLogs),
}));

export const clientesRelations = relations(clientes, ({ many }) => ({
    tramites: many(tramites),
    serviciosContratados: many(serviciosComplementarios),
}));

export const tramitesRelations = relations(tramites, ({ one, many }) => ({
    cliente: one(clientes, {
        fields: [tramites.clienteId],
        references: [clientes.id],
    }),
    usuarioAsignado: one(usuarios, {
        fields: [tramites.usuarioAsignadoId],
        references: [usuarios.id],
    }),
    tipoTramite: one(catTiposTramite, {
        fields: [tramites.tipoTramiteId],
        references: [catTiposTramite.id],
    }),
    estadoProceso: one(catEstadosProceso, {
        fields: [tramites.estadoProcesoId],
        references: [catEstadosProceso.id],
    }),
    estadoPago: one(catEstadosPago, {
        fields: [tramites.estadoPagoId],
        references: [catEstadosPago.id],
    }),
    citas: many(citas),
    documentos: many(documentos),
    logs: many(tramiteLogs),
}));

export const citasRelations = relations(citas, ({ one }) => ({
    tramite: one(tramites, {
        fields: [citas.tramiteId],
        references: [tramites.id],
    }),
    tipoCita: one(catTiposCita, {
        fields: [citas.tipoCitaId],
        references: [catTiposCita.id],
    }),
}));

export const documentosRelations = relations(documentos, ({ one }) => ({
    tramite: one(tramites, {
        fields: [documentos.tramiteId],
        references: [tramites.id],
    }),
    tipoDocumento: one(catTiposDocumento, {
        fields: [documentos.tipoDocumentoId],
        references: [catTiposDocumento.id],
    }),
}));

export const serviciosComplementariosRelations = relations(serviciosComplementarios, ({ one }) => ({
    cliente: one(clientes, {
        fields: [serviciosComplementarios.clienteId],
        references: [clientes.id],
    }),
    usuarioResponsable: one(usuarios, {
        fields: [serviciosComplementarios.usuarioResponsableId],
        references: [usuarios.id],
    }),
    tipoServicio: one(catTiposServicio, {
        fields: [serviciosComplementarios.tipoServicioId],
        references: [catTiposServicio.id],
    }),
}));

export const tramiteLogsRelations = relations(tramiteLogs, ({ one }) => ({
    tramite: one(tramites, {
        fields: [tramiteLogs.tramiteId],
        references: [tramites.id],
    }),
    usuario: one(usuarios, {
        fields: [tramiteLogs.usuarioId],
        references: [usuarios.id],
    }),
}));