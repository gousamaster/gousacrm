"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    Users,
    FileText,
    Clock,
    TrendingUp,
    Calendar,
    Package,
    CheckCircle,
    CalendarDays,
    AlertTriangle,
    Gift,
    Plane,
    Flag
} from "lucide-react"
import { PieChartComponent } from "./charts/pie-chart-component"
import { BarChartComponent } from "./charts/bar-chart-component"
import { LineChartComponent } from "./charts/line-chart-component"
import { formatDistanceToNow, format } from "date-fns"
import { es } from "date-fns/locale"
import {
    getDashboardStats,
    getTramitesEstadosDistribution,
    getTiposTramitesDistribution,
    getEstadosPagoDistribution,
    getMetricasMensuales,
    getProximasCitas,
    getTramitesRecientesIniciados,
    getTramitesCitasLejanas,
    getProximosServiciosComplementarios,
    getProximosCumpleanos,
} from "@/actions/dashboard"

export default function DashboardPage() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<any>(null)
    const [estadosData, setEstadosData] = useState<any[]>([])
    const [tiposData, setTiposData] = useState<any[]>([])
    const [pagosData, setPagosData] = useState<any[]>([])
    const [metricasData, setMetricasData] = useState<any>(null)

    // Nuevos estados
    const [proximasCitas, setProximasCitas] = useState<any[]>([])
    const [tramitesRecientes, setTramitesRecientes] = useState<any[]>([])
    const [citasLejanas, setCitasLejanas] = useState<any[]>([])
    const [proximosServicios, setProximosServicios] = useState<any[]>([])
    const [proximosCumpleanos, setProximosCumpleanos] = useState<any[]>([])

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true)
            try {
                const [
                    statsRes,
                    estadosRes,
                    tiposRes,
                    pagosRes,
                    metricasRes,
                    citasRes,
                    tramitesRecRes,
                    citasLejanasRes,
                    serviciosRes,
                    cumpleanosRes
                ] = await Promise.all([
                    getDashboardStats(),
                    getTramitesEstadosDistribution(),
                    getTiposTramitesDistribution(),
                    getEstadosPagoDistribution(),
                    getMetricasMensuales(),
                    getProximasCitas(),
                    getTramitesRecientesIniciados(),
                    getTramitesCitasLejanas(),
                    getProximosServiciosComplementarios(),
                    getProximosCumpleanos(),
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
                if (metricasRes.success && metricasRes.data) {
                    const { tramitesPorMes, clientesPorMes } = metricasRes.data
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

                // Nuevos datos
                if (citasRes.success) setProximasCitas(citasRes.data || [])
                if (tramitesRecRes.success) setTramitesRecientes(tramitesRecRes.data || [])
                if (citasLejanasRes.success) setCitasLejanas(citasLejanasRes.data || [])
                if (serviciosRes.success) setProximosServicios(serviciosRes.data || [])
                if (cumpleanosRes.success) setProximosCumpleanos(cumpleanosRes.data || [])
            } catch (error) {
                console.error("Error loading dashboard data:", error)
            } finally {
                setLoading(false)
            }
        }

        loadDashboardData()
    }, [])

    const getInitials = (nombres: string, apellidos: string) => {
        return `${nombres?.charAt(0) || ''}${apellidos?.charAt(0) || ''}`.toUpperCase()
    }

    if (loading) {
        return <DashboardSkeleton />
    }

    // Colores temáticos estadounidenses
    const usaColors = {
        primary: "#1e3a8a", // Azul navy
        secondary: "#dc2626", // Rojo
        accent: "#f8fafc", // Blanco/gris claro
        success: "#16a34a", // Verde
        warning: "#d97706", // Naranja/dorado
    }

    const statsCards = [
        {
            title: "Total Clientes",
            value: stats?.totalClientes || 0,
            icon: Users,
            description: "Clientes registrados",
            color: "text-blue-700",
            bgColor: "bg-blue-50",
        },
        {
            title: "Trámites Activos",
            value: stats?.tramitesActivos || 0,
            icon: Clock,
            description: "En proceso",
            color: "text-red-700",
            bgColor: "bg-red-50",
        },
        {
            title: "Completados",
            value: stats?.tramitesCompletados || 0,
            icon: CheckCircle,
            description: "Trámites finalizados",
            color: "text-green-700",
            bgColor: "bg-green-50",
        },
        {
            title: "Citas Hoy",
            value: stats?.citasHoy || 0,
            icon: CalendarDays,
            description: "Agenda de hoy",
            color: "text-blue-800",
            bgColor: "bg-blue-100",
        },
        {
            title: "Citas Pendientes",
            value: stats?.citasPendientes || 0,
            icon: Calendar,
            description: "Por realizar",
            color: "text-red-600",
            bgColor: "bg-red-50",
        },
        {
            title: "Servicios Activos",
            value: stats?.serviciosActivos || 0,
            icon: Package,
            description: "En ejecución",
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Nuevos Clientes",
            value: stats?.clientesRecientes || 0,
            icon: TrendingUp,
            description: "Últimos 30 días",
            color: "text-purple-700",
            bgColor: "bg-purple-50",
        },
        {
            title: "Total Trámites",
            value: stats?.totalTramites || 0,
            icon: FileText,
            description: "En el sistema",
            color: "text-gray-700",
            bgColor: "bg-gray-50",
        },
    ]

    return (
        <div className="space-y-6 bg-gradient-to-br from-blue-50 via-white to-red-50 min-h-screen">
            {/* Header con temática estadounidense */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-10"></div>
                <div className="relative flex items-center justify-between p-6 bg-white rounded-lg shadow-sm border-l-4 border-blue-600">
                    <div className="flex items-center space-x-4">
                        <Flag className="h-8 w-8 text-blue-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">GO USA Dashboard</h1>
                            <p className="text-gray-600">Tu puerta de entrada al crm</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Última actualización</p>
                        <p className="text-lg font-semibold text-gray-900">{format(new Date(), "dd/MM/yyyy HH:mm")}</p>
                    </div>
                </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((card, index) => {
                    const Icon = card.icon
                    return (
                        <Card key={index} className={`${card.bgColor} border-l-4 border-l-blue-600 hover:shadow-md transition-shadow`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-700">{card.title}</CardTitle>
                                <Icon className={`h-5 w-5 ${card.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                                <p className="text-xs text-gray-600">{card.description}</p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Sección de Alertas y Próximos Eventos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Próximas Citas */}
                <Card className="border-l-4 border-l-blue-600">
                    <CardHeader className="bg-blue-50">
                        <CardTitle className="flex items-center text-blue-800">
                            <Calendar className="mr-2 h-5 w-5" />
                            Próximas Citas (7 días)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                        {proximasCitas.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No hay citas próximas</p>
                        ) : (
                            proximasCitas.map((cita) => (
                                <div key={cita.id} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                    <Avatar className="h-8 w-8 bg-blue-600">
                                        <AvatarFallback className="text-white text-xs">
                                            {getInitials(cita.clienteNombres, cita.clienteApellidos)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{cita.clienteNombres} {cita.clienteApellidos}</p>
                                        <p className="text-xs text-gray-600">{cita.tipoCita}</p>
                                        <p className="text-xs text-blue-600">{format(new Date(cita.fechaHora), "dd/MM HH:mm")}</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {formatDistanceToNow(new Date(cita.fechaHora), { addSuffix: true, locale: es })}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Trámites Recientes */}
                <Card className="border-l-4 border-l-green-600">
                    <CardHeader className="bg-green-50">
                        <CardTitle className="flex items-center text-green-800">
                            <FileText className="mr-2 h-5 w-5" />
                            Trámites Iniciados (7 días)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                        {tramitesRecientes.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No hay trámites recientes</p>
                        ) : (
                            tramitesRecientes.map((tramite) => (
                                <div key={tramite.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                    <Avatar className="h-8 w-8 bg-green-600">
                                        <AvatarFallback className="text-white text-xs">
                                            {getInitials(tramite.clienteNombres, tramite.clienteApellidos)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{tramite.clienteNombres} {tramite.clienteApellidos}</p>
                                        <p className="text-xs text-gray-600">{tramite.tipoTramite}</p>
                                        <Badge variant="outline" className="text-xs">
                                            {tramite.estadoProceso}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-green-600">
                                        {formatDistanceToNow(new Date(tramite.fechaCreacion), { addSuffix: true, locale: es })}
                                    </p>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Próximos Cumpleaños */}
                <Card className="border-l-4 border-l-purple-600">
                    <CardHeader className="bg-purple-50">
                        <CardTitle className="flex items-center text-purple-800">
                            <Gift className="mr-2 h-5 w-5" />
                            Próximos Cumpleaños
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                        {proximosCumpleanos.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No hay cumpleaños próximos</p>
                        ) : (
                            proximosCumpleanos.map((cliente) => (
                                <div key={cliente.id} className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                                    <Avatar className="h-8 w-8 bg-purple-600">
                                        <AvatarFallback className="text-white text-xs">
                                            {getInitials(cliente.nombres, cliente.apellidos)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{cliente.nombres} {cliente.apellidos}</p>
                                        <p className="text-xs text-gray-600">
                                            {format(new Date(cliente.fechaNacimiento), "dd/MM")}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-xs text-purple-600">
                                        {cliente.diasRestantes === 0 ? "¡Hoy!" : `${cliente.diasRestantes} días`}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Alertas Importantes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Citas Lejanas - Recordatorio */}
                <Card className="border-l-4 border-l-yellow-500">
                    <CardHeader className="bg-yellow-50">
                        <CardTitle className="flex items-center text-yellow-800">
                            <AlertTriangle className="mr-2 h-5 w-5" />
                            ⚠️ Citas Lejanas (+60 días)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                        <div className="bg-yellow-100 p-3 rounded-lg border border-yellow-300">
                            <p className="text-sm text-yellow-800 font-medium">💡 Recordatorio:</p>
                            <p className="text-xs text-yellow-700">Revisa la página de la embajada para adelantar estas citas</p>
                        </div>
                        {citasLejanas.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">¡Excelente! No hay citas muy lejanas</p>
                        ) : (
                            citasLejanas.map((tramite) => (
                                <div key={tramite.citaId} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                                    <Avatar className="h-8 w-8 bg-yellow-600">
                                        <AvatarFallback className="text-white text-xs">
                                            {getInitials(tramite.clienteNombres, tramite.clienteApellidos)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{tramite.clienteNombres} {tramite.clienteApellidos}</p>
                                        <p className="text-xs text-gray-600">{tramite.tipoCita}</p>
                                        <p className="text-xs text-yellow-600">
                                            {format(new Date(tramite.fechaCita), "dd/MM/yyyy")}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-xs text-yellow-700">
                                        {tramite.diasRestantes} días
                                    </Badge>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Próximos Servicios Complementarios */}
                <Card className="border-l-4 border-l-indigo-600">
                    <CardHeader className="bg-indigo-50">
                        <CardTitle className="flex items-center text-indigo-800">
                            <Plane className="mr-2 h-5 w-5" />
                            Próximos Servicios
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                        {proximosServicios.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No hay servicios próximos</p>
                        ) : (
                            proximosServicios.map((servicio) => (
                                <div key={servicio.id} className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
                                    <Avatar className="h-8 w-8 bg-indigo-600">
                                        <AvatarFallback className="text-white text-xs">
                                            {getInitials(servicio.clienteNombres, servicio.clienteApellidos)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{servicio.clienteNombres} {servicio.clienteApellidos}</p>
                                        <p className="text-xs text-gray-600">{servicio.tipoServicio}</p>
                                        <p className="text-xs text-indigo-600">
                                            {format(new Date(servicio.fechaInicioServicio), "dd/MM/yyyy")}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {formatDistanceToNow(new Date(servicio.fechaInicioServicio), { addSuffix: true, locale: es })}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Gráficas Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-t-4 border-t-blue-600">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                        <CardTitle className="text-blue-800">Estados de Trámites</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PieChartComponent
                            data={estadosData}
                            colors={["#1e40af", "#dc2626", "#059669", "#d97706", "#7c3aed"]}
                        />
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-red-600">
                    <CardHeader className="bg-gradient-to-r from-red-50 to-white">
                        <CardTitle className="text-red-800">Tipos de Trámites</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BarChartComponent data={tiposData} color="#dc2626" />
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-green-600">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-white">
                        <CardTitle className="text-green-800">Estados de Pago</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PieChartComponent
                            data={pagosData}
                            colors={["#16a34a", "#d97706", "#dc2626"]}
                        />
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-purple-600">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-white">
                        <CardTitle className="text-purple-800">Tendencia Mensual</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {metricasData && metricasData.length > 0 ? (
                            <LineChartComponent data={metricasData} />
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                No hay datos suficientes
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Footer temático */}
            <div className="text-center py-6">
                <div className="inline-flex items-center space-x-2 text-gray-600">
                    <Flag className="h-5 w-5 text-blue-600" />
                    <span>GO USA CRM - Making American Dreams Come True</span>
                    <Flag className="h-5 w-5 text-red-600" />
                </div>
            </div>
        </div>
    )
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="p-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96 mt-2" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-5 w-5" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-3 w-32 mt-1" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Activity Cards Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, j) => (
                                    <div key={j} className="flex items-center space-x-3">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div className="flex-1">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-24 mt-1" />
                                        </div>
                                        <Skeleton className="h-6 w-16" />
                                    </div>
                                ))}
                            </div>
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