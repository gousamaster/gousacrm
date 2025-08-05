import 'dotenv/config'; // Asegura que las variables de .env.local estén disponibles
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/lib/db/schema'; // Corrige la ruta si el archivo está en ../src/lib/db/schema

// Datos iniciales que queremos insertar
const tiposTramiteData = [
    { nombreTipo: 'Visa Nueva' },
    { nombreTipo: 'Renovación de Visa' },
    { nombreTipo: 'DS-11 Residencia Bolivia' },
];

const estadosProcesoData = [
    { nombreEstado: 'Nuevo' },
    { nombreEstado: 'Pendiente de Pago' },
    { nombreEstado: 'Cita Agendada' },
    { nombreEstado: 'Simulacro Agendado' },
    { nombreEstado: 'Aprobado' },
    { nombreEstado: 'Rechazado' },
    { nombreEstado: 'Cerrado' },
];

const estadosPagoData = [
    { nombreEstado: 'Pendiente de Pago' },
    { nombreEstado: 'Pago Parcial' },
    { nombreEstado: 'Pagado Completamente' },
];

const tiposCitaData = [{ nombreTipo: 'Entrevista Embajada' }, { nombreTipo: 'Simulacro' }];

const tiposDocumentoData = [
    { nombreTipo: 'Pasaporte' },
    { nombreTipo: 'Fotografía' },
    { nombreTipo: 'Confirmación de Pago' },
    { nombreTipo: 'Acuerdo de Confidencialidad' },
];

const tiposServicioData = [
    { nombreServicio: 'Paquete de Viaje' },
    { nombreServicio: 'Reserva de Hotel' },
    { nombreServicio: 'Tickets de Parque' },
    { nombreServicio: 'Alquiler de Auto' },
];

async function main() {
    console.log('🌱 Empezando el seeding de la base de datos...');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);

    console.log('Insertando tipos de trámite...');
    await db.insert(schema.catTiposTramite).values(tiposTramiteData).onConflictDoNothing();

    console.log('Insertando estados de proceso...');
    await db.insert(schema.catEstadosProceso).values(estadosProcesoData).onConflictDoNothing();

    console.log('Insertando estados de pago...');
    await db.insert(schema.catEstadosPago).values(estadosPagoData).onConflictDoNothing();

    console.log('Insertando tipos de cita...');
    await db.insert(schema.catTiposCita).values(tiposCitaData).onConflictDoNothing();

    console.log('Insertando tipos de documento...');
    await db.insert(schema.catTiposDocumento).values(tiposDocumentoData).onConflictDoNothing();

    console.log('Insertando tipos de servicio...');
    await db.insert(schema.catTiposServicio).values(tiposServicioData).onConflictDoNothing();

    console.log('✅ Seeding completado con éxito!');
    await pool.end();
}

main().catch((err) => {
    console.error('❌ Error durante el seeding:', err);
    process.exit(1);
});