"use client"

import { IconBrandWhatsapp } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

interface WhatsAppHelpButtonProps {
    phoneNumber?: string
    message?: string
    className?: string
}

export function WhatsAppHelpButton({
    phoneNumber = "59177592025",
    message = "Hola, necesito ayuda con GO USA CRM",
    className,
}: WhatsAppHelpButtonProps) {
    const handleWhatsAppClick = () => {
        const encodedMessage = encodeURIComponent(message)
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
        window.open(whatsappUrl, "_blank", "noopener,noreferrer")
    }

    return (
        <Button onClick={handleWhatsAppClick} variant="outline" className={`flex items-center gap-2 ${className}`}>
            <IconBrandWhatsapp className="h-4 w-4 text-green-600" />
            <span>Contactar por WhatsApp</span>
        </Button>
    )
}
