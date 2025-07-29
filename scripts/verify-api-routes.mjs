import { readFileSync, existsSync } from "fs"
import { join } from "path"

function verifyApiRoutes() {
    console.log("🔍 Verificando estructura de rutas de API...")

    const routes = [
        {
            path: "app/api/health/route.ts",
            description: "Health check endpoint",
        },
    ]

    let allGood = true

    for (const route of routes) {
        const fullPath = join(process.cwd(), route.path)

        if (existsSync(fullPath)) {
            console.log(`✅ ${route.description}: ${route.path}`)

            // Verificar contenido básico
            try {
                const content = readFileSync(fullPath, "utf8")
                if (content.includes("export async function GET")) {
                    console.log(`   ✅ Función GET encontrada`)
                } else {
                    console.log(`   ❌ Función GET no encontrada`)
                    allGood = false
                }

                if (content.includes("NextResponse.json")) {
                    console.log(`   ✅ NextResponse.json encontrado`)
                } else {
                    console.log(`   ❌ NextResponse.json no encontrado`)
                    allGood = false
                }
            } catch (error) {
                console.log(`   ❌ Error leyendo archivo: ${error.message}`)
                allGood = false
            }
        } else {
            console.log(`❌ ${route.description}: ${route.path} NO EXISTE`)
            allGood = false
        }
    }

    console.log("")
    if (allGood) {
        console.log("✅ Todas las rutas de API están correctas")
        console.log("💡 Prueba acceder a: http://localhost:3000/api/health")
    } else {
        console.log("❌ Hay problemas con las rutas de API")
        console.log("💡 Asegúrate de que:")
        console.log("   1. El archivo app/api/health/route.ts existe")
        console.log("   2. Exporta una función GET")
        console.log("   3. El servidor de desarrollo está corriendo")
    }
}

verifyApiRoutes()
