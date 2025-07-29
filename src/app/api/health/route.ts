import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
    try {
        console.log("🔍 Health check iniciado...")

        // Hacer una query muy simple y rápida
        const startTime = Date.now()

        // Usar una query más simple que funcione con Drizzle
        const result = await db.execute("SELECT 1 as health_check")

        const responseTime = Date.now() - startTime

        console.log("✅ Health check exitoso, tiempo:", responseTime + "ms")

        return NextResponse.json({
            status: "ok",
            database: "connected",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString(),
            result: result[0] || "OK",
        })
    } catch (error) {
        console.error("❌ Health check falló:", error)

        return NextResponse.json(
            {
                status: "error",
                database: "disconnected",
                error: error instanceof Error ? error.message : "Database connection failed",
                timestamp: new Date().toISOString(),
            },
            { status: 500 },
        )
    }
}
