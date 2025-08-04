"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface RecentActivityProps {
    actividad: {
        tramitesRecientes: Array<{
            id: number
            fechaCreacion: Date
            clienteNombres: string | null
            clienteApellidos: string | null
            tipoTramite: string | null
            estadoProceso: string | null
        }>
        clientesRecientes: Array<{
            id: number
            nombres: string
            apellidos: string
            email: string | null
            fechaCreacion: Date
        }>
    }
}

export function RecentActivity({ actividad }: RecentActivityProps) {
    const getInitials = (nombres: string, apellidos: string) => {
        return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase()
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trámites Recientes */}
            <Card>
                <CardHeader>
                    <CardTitle>Trámites Recientes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {actividad.tramitesRecientes.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No hay trámites recientes</p>
                    ) : (
                        actividad.tramitesRecientes.map((tramite) => (
                            <div key={tramite.id} className="flex items-center space-x-4">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                        {tramite.clienteNombres && tramite.clienteApellidos
                                            ? getInitials(tramite.clienteNombres, tramite.clienteApellidos)
                                            : "??"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">
                                        {tramite.clienteNombres} {tramite.clienteApellidos}
                                    </p>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-xs text-muted-foreground">{tramite.tipoTramite}</p>
                                        {tramite.estadoProceso && (
                                            <Badge variant="outline" className="text-xs">
                                                {tramite.estadoProceso}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(tramite.fechaCreacion), {
                                        addSuffix: true,
                                        locale: es,
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            {/* Clientes Recientes */}
            <Card>
                <CardHeader>
                    <CardTitle>Clientes Recientes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {actividad.clientesRecientes.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No hay clientes recientes</p>
                    ) : (
                        actividad.clientesRecientes.map((cliente) => (
                            <div key={cliente.id} className="flex items-center space-x-4">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">{getInitials(cliente.nombres, cliente.apellidos)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">
                                        {cliente.nombres} {cliente.apellidos}
                                    </p>
                                    {cliente.email && <p className="text-xs text-muted-foreground">{cliente.email}</p>}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(cliente.fechaCreacion), {
                                        addSuffix: true,
                                        locale: es,
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
