"use client"

import { useState, useEffect } from "react"

interface DatabaseStatus {
    isConnected: boolean
    isLoading: boolean
    lastChecked: Date | null
    error: string | null
}

export function useDatabaseStatus() {
    const [status, setStatus] = useState<DatabaseStatus>({
        isConnected: false,
        isLoading: true,
        lastChecked: null,
        error: null,
    })

    const checkConnection = async () => {
        try {
            setStatus((prev) => ({ ...prev, isLoading: true, error: null }))

            // Llamada a nuestro endpoint de health check
            const response = await fetch("/api/health", {
                method: "GET",
                cache: "no-store", // No cachear para obtener estado real
            })

            const data = await response.json()

            setStatus({
                isConnected: data.database === "connected",
                isLoading: false,
                lastChecked: new Date(),
                error: data.database !== "connected" ? data.error : null,
            })
        } catch (error) {
            setStatus({
                isConnected: false,
                isLoading: false,
                lastChecked: new Date(),
                error: error instanceof Error ? error.message : "Error desconocido",
            })
        }
    }

    useEffect(() => {
        // Verificar inmediatamente al montar
        checkConnection()

        // Verificar cada 5 minutos (no muy frecuente para no consumir recursos)
        const interval = setInterval(checkConnection, 5 * 60 * 1000)

        return () => clearInterval(interval)
    }, [])

    return {
        ...status,
        refresh: checkConnection,
    }
}
