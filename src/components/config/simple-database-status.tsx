"use client"

import { useDatabaseStatus } from "@/hooks/use-database-status"

export function SimpleDatabaseStatus() {
    const { isConnected, isLoading } = useDatabaseStatus()

    const getStatusColor = () => {
        if (isLoading) return "bg-yellow-500"
        if (isConnected) return "bg-green-500"
        return "bg-red-500"
    }

    const getStatusText = () => {
        if (isLoading) return "Verificando..."
        if (isConnected) return "Conectado"
        return "Sin conexión"
    }

    return (
        <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${getStatusColor()}`} />
            <span className="text-sm text-muted-foreground">{getStatusText()}</span>
        </div>
    )
}
