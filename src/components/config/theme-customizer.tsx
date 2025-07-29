"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Monitor, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeCustomizer() {
    const { theme, setTheme, themes } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Evitar hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="cursor-pointer">
                        <CardContent className="p-4">
                            <div className="space-y-2">
                                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    const themeOptions = [
        {
            name: "light",
            label: "Claro",
            icon: Sun,
            description: "Tema claro para uso diurno",
        },
        {
            name: "dark",
            label: "Oscuro",
            icon: Moon,
            description: "Tema oscuro para uso nocturno",
        },
        {
            name: "system",
            label: "Sistema",
            icon: Monitor,
            description: "Sigue la configuración del sistema",
        },
    ]

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {themeOptions.map((option) => {
                    const Icon = option.icon
                    const isSelected = theme === option.name

                    return (
                        <Card
                            key={option.name}
                            className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary shadow-md" : ""
                                }`}
                            onClick={() => setTheme(option.name)}
                        >
                            <CardContent className="p-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        <Label className="cursor-pointer font-medium">{option.label}</Label>
                                        {isSelected && <div className="ml-auto h-2 w-2 bg-primary rounded-full" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{option.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Preview del tema actual */}
            <div className="mt-6">
                <Label className="text-sm font-medium">Vista previa</Label>
                <Card className="mt-2">
                    <CardContent className="p-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Ejemplo de tarjeta</p>
                                    <p className="text-xs text-muted-foreground">
                                        Así se ve el contenido con el tema{" "}
                                        {theme === "system" ? "del sistema" : theme === "dark" ? "oscuro" : "claro"}
                                    </p>
                                </div>
                                <Button size="sm" variant="outline">
                                    Botón
                                </Button>
                            </div>
                            <div className="h-2 bg-muted rounded-full">
                                <div className="h-2 bg-primary rounded-full w-1/3" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
