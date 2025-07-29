"use client"

import { useDatabaseStatus } from "@/hooks/use-database-status"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RefreshCw, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export function DatabaseStatus() {
    const { isConnected, isLoading, lastChecked, error, refresh } = useDatabaseStatus()

    const getStatusColor = () => {
        if (isLoading) return "bg-yellow-500"
        if (isConnected) return "bg-green-500"
        return "bg-red-500"
    }

    const getStatusText = () => {
        if (isLoading) return "Verificando..."
        if (isConnected) return "Conectado"
        return "Desconectado"
    }

    const getStatusIcon = () => {
        if (isLoading) return <Loader2 className="h-3 w-3 animate-spin" />
        if (isConnected) return <CheckCircle className="h-3 w-3" />
        return <AlertCircle className="h-3 w-3" />
    }

    return (
        <TooltipProvider>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${getStatusColor()}`} />
                    <span className="text-sm text-muted-foreground">{getStatusText()}</span>
                </div>

                <Tooltip >
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={refresh} disabled={isLoading} className="h-6 w-6 p-0">
                            <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="space-y-1">
                            <p className="font-medium">Estado de la Base de Datos</p>
                            <p className="text-xs">Estado: {getStatusText()}</p>
                            {lastChecked && <p className="text-xs">Última verificación: {lastChecked.toLocaleTimeString()}</p>}
                            {error && <p className="text-xs text-red-300">Error: {error}</p>}
                            <p className="text-xs text-white">Click para actualizar</p>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    )
}
