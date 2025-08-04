import { NextResponse } from "next/server"

export async function GET() {
    try {
        console.log("🔍 Verificando DNS y conectividad...")

        const databaseUrl = process.env.DATABASE_URL
        if (!databaseUrl) {
            throw new Error("DATABASE_URL no configurada")
        }

        // Extraer hostname de la URL
        const urlMatch = databaseUrl.match(/postgresql:\/\/[^@]+@([^:]+):/)
        const hostname = urlMatch ? urlMatch[1] : null

        console.log("🌐 Hostname extraído:", hostname)

        const diagnostics = {
            databaseUrl: databaseUrl.substring(0, 50) + "...",
            hostname,
            tests: {} as any,
        }

        // Test 1: Verificar si podemos resolver el DNS usando fetch
        console.log("🔍 Test 1: Verificando DNS con fetch...")
        try {
            const testUrl = `https://${hostname?.replace("db.", "")}/rest/v1/`
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)

            const response = await fetch(testUrl, {
                method: "HEAD",
                signal: controller.signal,
            })

            clearTimeout(timeoutId)

            diagnostics.tests.dnsResolution = {
                success: true,
                status: response.status,
                message: "DNS resuelve correctamente",
            }
        } catch (error) {
            diagnostics.tests.dnsResolution = {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido",
                message: "No se puede resolver el DNS",
            }
        }

        // Test 2: Verificar conectividad con postgres usando timeout corto
        console.log("🔍 Test 2: Verificando conectividad postgres...")
        try {
            const postgres = (await import("postgres")).default

            // Configuración con timeout muy corto para detectar problemas rápido
            const client = postgres(databaseUrl, {
                max: 1,
                connect_timeout: 5, // 5 segundos
                idle_timeout: 5,
                ssl: { rejectUnauthorized: false },
                prepare: false,
            })

            // Intentar conexión con timeout
            const result = await Promise.race([
                client`SELECT 1 as test`,
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout de conexión")), 8000)),
            ])

            await client.end()

            diagnostics.tests.postgresConnection = {
                success: true,
                result: result,
                message: "Conexión postgres exitosa",
            }
        } catch (error) {
            diagnostics.tests.postgresConnection = {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido",
                message: "Fallo en conexión postgres",
            }
        }

        // Test 3: Verificar estado del proyecto Supabase
        console.log("🔍 Test 3: Verificando estado del proyecto Supabase...")
        try {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

            if (supabaseUrl && supabaseKey) {
                const response = await fetch(`${supabaseUrl}/rest/v1/`, {
                    method: "HEAD",
                    headers: {
                        apikey: supabaseKey,
                        Authorization: `Bearer ${supabaseKey}`,
                    },
                })

                diagnostics.tests.supabaseStatus = {
                    success: response.ok,
                    status: response.status,
                    message: response.ok ? "Proyecto Supabase activo" : "Proyecto Supabase inactivo",
                }
            } else {
                diagnostics.tests.supabaseStatus = {
                    success: false,
                    message: "Variables de Supabase no configuradas",
                }
            }
        } catch (error) {
            diagnostics.tests.supabaseStatus = {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido",
                message: "No se puede verificar estado de Supabase",
            }
        }

        return NextResponse.json({
            success: true,
            message: "Diagnóstico DNS completado",
            diagnostics,
            recommendations: [
                "Si DNS falla: El proyecto de Supabase podría estar pausado",
                "Si postgres falla: Verifica que el proyecto esté activo en Supabase",
                "Si Supabase API falla: Revisa las variables de entorno",
                "Considera usar pooling de conexiones o Supabase REST API",
            ],
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error("❌ Error en diagnóstico DNS:", error)

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido",
                timestamp: new Date().toISOString(),
            },
            { status: 500 },
        )
    }
}
