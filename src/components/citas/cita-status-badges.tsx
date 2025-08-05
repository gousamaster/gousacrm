import { Badge } from "@/components/ui/badge"

interface CitaStatusBadgeProps {
    status: string
    type: "estado" | "pago"
}

export function CitaStatusBadge({ status, type }: CitaStatusBadgeProps) {
    const getColor = (status: string, type: string) => {
        if (type === "estado") {
            switch (status.toLowerCase()) {
                case "programada":
                    return "bg-blue-100 text-blue-800 hover:bg-blue-100"
                case "completada":
                    return "bg-green-100 text-green-800 hover:bg-green-100"
                case "cancelada":
                    return "bg-red-100 text-red-800 hover:bg-red-100"
                case "reprogramada":
                    return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                default:
                    return "bg-gray-100 text-gray-800 hover:bg-gray-100"
            }
        } else {
            switch (status.toLowerCase()) {
                case "pagado":
                    return "bg-green-100 text-green-800 hover:bg-green-100"
                case "pendiente":
                    return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                default:
                    return "bg-gray-100 text-gray-800 hover:bg-gray-100"
            }
        }
    }

    return (
        <Badge variant="outline" className={getColor(status, type)}>
            {status}
        </Badge>
    )
}
