import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
    status: string
    type: "proceso" | "pago"
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
    const getVariant = (status: string, type: string) => {
        if (type === "proceso") {
            switch (status.toLowerCase()) {
                case "iniciado":
                case "en proceso":
                    return "default"
                case "documentos pendientes":
                case "pendiente":
                    return "secondary"
                case "completado":
                case "aprobado":
                    return "default"
                case "rechazado":
                case "cancelado":
                    return "destructive"
                default:
                    return "outline"
            }
        } else {
            switch (status.toLowerCase()) {
                case "pagado":
                case "completado":
                    return "default"
                case "pendiente":
                case "parcial":
                    return "secondary"
                case "vencido":
                case "rechazado":
                    return "destructive"
                default:
                    return "outline"
            }
        }
    }

    const getColor = (status: string, type: string) => {
        if (type === "proceso") {
            switch (status.toLowerCase()) {
                case "iniciado":
                case "en proceso":
                    return "bg-blue-100 text-blue-800 hover:bg-blue-100"
                case "documentos pendientes":
                case "pendiente":
                    return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                case "completado":
                case "aprobado":
                    return "bg-green-100 text-green-800 hover:bg-green-100"
                case "rechazado":
                case "cancelado":
                    return "bg-red-100 text-red-800 hover:bg-red-100"
                default:
                    return ""
            }
        } else {
            switch (status.toLowerCase()) {
                case "pagado":
                case "completado":
                    return "bg-green-100 text-green-800 hover:bg-green-100"
                case "pendiente":
                case "parcial":
                    return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                case "vencido":
                case "rechazado":
                    return "bg-red-100 text-red-800 hover:bg-red-100"
                default:
                    return ""
            }
        }
    }

    return (
        <Badge variant={getVariant(status, type)} className={getColor(status, type)}>
            {status}
        </Badge>
    )
}
