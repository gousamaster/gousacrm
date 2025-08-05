import { Badge } from "@/components/ui/badge"

interface DocumentoStatusBadgeProps {
    status: string
}

export function DocumentoStatusBadge({ status }: DocumentoStatusBadgeProps) {
    const getColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "aprobado":
                return "bg-green-100 text-green-800 hover:bg-green-100"
            case "pendiente":
                return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
            case "rechazado":
                return "bg-red-100 text-red-800 hover:bg-red-100"
            default:
                return "bg-gray-100 text-gray-800 hover:bg-gray-100"
        }
    }

    return (
        <Badge variant="outline" className={getColor(status)}>
            {status}
        </Badge>
    )
}
