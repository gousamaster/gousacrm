"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatsCards } from "./stats-cards"
import { PieChartComponent } from "./charts/pie-chart-component"
import { BarChartComponent } from "./charts/bar-chart-component"
import { LineChartComponent } from "./charts/line-chart-component"
import { RecentActivity } from "./recent-activity"
import {
    getDashboardStats,
    getTramitesEstadosDistribution,
    getTiposTramitesDistribution,
    getEstadosPagoDistribution,
    getActividadReciente,
    getTramitesPorUsuario,
    getMetricasMensuales,
} from "@/actions/dashboard"

export default function DashboardPage() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<any>(null)
    const [estadosData, setEstadosData] = useState<any[]>([])
    const [tiposData, setTiposData] = useState<any[]>([])
    const [pagosData, setPagosData] = useState<any[]>([])
    const [actividad, setActividad] = useState<any>(null)
    const [usuariosData, setUsuariosData] = useState<any[]>([])
    const [metricasData, setMetricasData] = useState<any>(null)

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true)
            try {
                const [statsRes, estadosRes, tiposRes, pagosRes, actividadRes, usuariosRes, metricasRes] = await Promise.all([
                    getDashboardStats(),
                    getTramitesEstadosDistribution(),
                    getTiposTramitesDistribution(),
                    getEstadosPagoDistribution(),
                    getActividadReciente(),
                    getTramitesPorUsuario(),
                    getMetricasMensuales(),
                ])

                if (statsRes.success) setStats(statsRes.data)
                if (estadosRes.success) {
                    setEstadosData(
                        (estadosRes.data ?? []).map((item: any) => ({
                            name: item.estado || "Sin estado",
                            value: Number(item.count),
                        })),
                    )
                }
                if (tiposRes.success) {
                    setTiposData(
                        (tiposRes.data ?? []).map((item: any) => ({
                            name: item.tipo || "Sin tipo",
                            value: Number(item.count),
                        })),
                    )
                }
                if (pagosRes.success) {
                    setPagosData(
                        (pagosRes.data ?? []).map((item: any) => ({
                            name: item.estado || "Sin estado",
                            value: Number(item.count),
                        })),
                    )
                }
                if (actividadRes.success) setActividad(actividadRes.data)
                if (usuariosRes.success) {
                    setUsuariosData(
                        (usuariosRes.data ?? []).map((item: any) => ({
                            name: item.usuario || "Sin asignar",
                            value: Number(item.count),
                        })),
                    )
                }
                if (metricasRes.success && metricasRes.data) {
                    const { tramitesPorMes, clientesPorMes } = metricasRes.data

                    // Combinar datos por mes
                    const mesesMap = new Map()

                    tramitesPorMes.forEach((item: any) => {
                        mesesMap.set(item.mes, { name: item.mes, tramites: Number(item.count), clientes: 0 })
                    })

                    clientesPorMes.forEach((item: any) => {
                        const existing = mesesMap.get(item.mes) || { name: item.mes, tramites: 0, clientes: 0 }
                        existing.clientes = Number(item.count)
                        mesesMap.set(item.mes, existing)
                    })

                    setMetricasData(Array.from(mesesMap.values()).sort((a, b) => a.name.localeCompare(b.name)))
                }
            } catch (error) {
                console.error("Error loading dashboard data:", error)
            } finally {
                setLoading(false)
            }
        }

        loadDashboardData()
    }, [])

    if (loading) {
        return <DashboardSkeleton />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Vista general de GO USA CRM</p>
            </div>

            {/* Stats Cards */}
            {stats && <StatsCards stats={stats} />}

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Estados de Trámites</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PieChartComponent data={estadosData} colors={["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Tipos de Trámites</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BarChartComponent data={tiposData} color="#00C49F" />
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Estados de Pago</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PieChartComponent data={pagosData} colors={["#00C49F", "#FFBB28", "#FF8042"]} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Trámites por Usuario</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BarChartComponent data={usuariosData} color="#8884D8" />
                    </CardContent>
                </Card>
            </div>

            {/* Métricas Mensuales */}
            {metricasData && metricasData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Tendencia Mensual (Últimos 6 meses)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <LineChartComponent data={metricasData} />
                    </CardContent>
                </Card>
            )}

            {/* Actividad Reciente */}
            {actividad && <RecentActivity actividad={actividad} />}
        </div>
    )
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-3 w-32 mt-1" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-64 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
