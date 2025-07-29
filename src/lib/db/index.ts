import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Verificar que la URL de la base de datos esté configurada
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required")
}

// Crear la conexión a PostgreSQL
const connectionString = process.env.DATABASE_URL

// Configurar el cliente de postgres
const client = postgres(connectionString, {
    max: 1, // Máximo número de conexiones
})

// Crear la instancia de Drizzle con el schema
export const db = drizzle(client, { schema })

// Exportar el cliente para uso directo si es necesario
export { client }