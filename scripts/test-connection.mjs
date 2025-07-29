import postgres from "postgres"
import { readFileSync } from "fs"
import { join } from "path"

// Función para cargar .env.local manualmente
function loadEnv() {
    try {
        const envPath = join(process.cwd(), '.env')
        const envContent = readFileSync(envPath, 'utf8')

        envContent.split('\n').forEach(line => {
            const trimmedLine = line.trim()
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                const [key, ...valueParts] = trimmedLine.split('=')
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=').replace(/^["']|["']$/g, '')
                    process.env[key] = value
                }
            }
        })

        console.log("✅ Variables de entorno cargadas:")
        console.log("🔗 DATABASE_URL:", process.env.DATABASE_URL ? "✅ Configurada" : "❌ No encontrada")
        console.log("🌐 SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Configurada" : "❌ No encontrada")

    } catch (error) {
        console.error("❌ Error leyendo .env.local:", error.message)
    }
}

async function testConnection() {
    console.log("🔍 Verificando conexión a Supabase...")

    // Cargar variables de entorno manualmente
    loadEnv()

    // Verificar que la variable de entorno existe
    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL no está configurada después de cargar .env.local")
        return
    }

    console.log("🔗 DATABASE_URL encontrada:", process.env.DATABASE_URL.substring(0, 50) + "...")

    try {
        // Crear conexión directa con postgres
        const sql = postgres(process.env.DATABASE_URL, {
            max: 1,
            ssl: { rejectUnauthorized: false },
            connect_timeout: 10, // 10 segundos timeout
        })

        console.log("🔌 Intentando conectar...")

        // Probar conexión simple con timeout
        const result = await Promise.race([
            sql`SELECT NOW() as current_time`,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout - posible bloqueo de firewall")), 10000)
            )
        ])

        console.log("✅ Conexión exitosa!")
        console.log("⏰ Hora del servidor:", result[0].current_time)

        // Verificar si la tabla clientes existe
        console.log("🔍 Verificando tabla 'clientes'...")
        const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'clientes'
      ) as table_exists
    `

        if (tableCheck[0].table_exists) {
            console.log("✅ Tabla 'clientes' existe")

            // Contar registros
            const count = await sql`SELECT COUNT(*) as total FROM clientes`
            console.log("📊 Total de registros en clientes:", count[0].total)

            // Mostrar algunos registros
            if (parseInt(count[0].total) > 0) {
                const sample = await sql`SELECT id, nombres, apellidos, fecha_creacion FROM clientes LIMIT 3`
                console.log("📋 Muestra de datos:", sample)
            }
        } else {
            console.log("❌ Tabla 'clientes' NO existe")
            console.log("💡 Necesitas crear la tabla primero")
        }

        await sql.end()
    } catch (error) {
        console.error("❌ Error de conexión:", error.message)

        if (error.message.includes("ENOTFOUND") || error.message.includes("Timeout")) {
            console.log("")
            console.log("🚨 PROBLEMA DE RED/FIREWALL DETECTADO")
            console.log("💡 Esto es común en redes corporativas que bloquean conexiones directas a bases de datos")
            console.log("🏢 Estás en una red de trabajo que probablemente bloquea el puerto 5432 (PostgreSQL)")
            console.log("")
            console.log("🔧 SOLUCIONES:")
            console.log("1. Usa tu red personal/móvil para desarrollo")
            console.log("2. Pide al IT que abra el puerto 5432 para db.*.supabase.co")
            console.log("3. Usa la interfaz web de Supabase para crear la tabla")
            console.log("")
            console.log("📱 PRUEBA RÁPIDA: Conecta tu laptop al hotspot de tu teléfono y vuelve a ejecutar este script")
        }

        if (error.message.includes("authentication")) {
            console.log("🚨 Error de autenticación")
            console.log("💡 Verifica tu contraseña de base de datos en DATABASE_URL")
        }
    }
}

testConnection()
