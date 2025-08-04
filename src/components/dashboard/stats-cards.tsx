"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Clock, TrendingUp } from "lucide-react"

interface StatsCardsProps {
    stats: {
        totalClientes: number
        totalTramites: number
        tramitesActivos: number
        clientesRecientes: number
    }
}

export function StatsCards({ stats }: StatsCardsProps) {
    const cards = [
        {
            title: "Total Clientes",
            value: stats.totalClientes,
            icon: Users,
            description: "Clientes registrados",
            color: "text-blue-600",
        },
        {
            title: "Total Trámites",
            value: stats.totalTramites,
            icon: FileText,
            description: "Trámites en el sistema",
            color: "text-green-600",
        },
        {
            title: "Trámites Activos",
            value: stats.tramitesActivos,
            icon: Clock,
            description: "En proceso",
            color: "text-yellow-600",
        },
        {
            title: "Clientes Recientes",
            value: stats.clientesRecientes,
            icon: TrendingUp,
            description: "Últimos 30 días",
            color: "text-purple-600",
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => {
                const Icon = card.icon
                return (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <Icon className={`h-4 w-4 ${card.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                            <p className="text-xs text-muted-foreground">{card.description}</p>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
