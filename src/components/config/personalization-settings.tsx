"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export function PersonalizationSettings() {
    const [settings, setSettings] = useState({
        compactMode: false,
        showAnimations: true,
        autoSave: true,
        language: "es",
        dateFormat: "dd/mm/yyyy",
        timeFormat: "24h",
    })

    const updateSetting = (key: string, value: boolean | string) => {
        setSettings((prev) => ({ ...prev, [key]: value }))
    }

    return (
        <div className="space-y-6">
            {/* Configuraciones de Interfaz */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="compact-mode">Modo Compacto</Label>
                        <p className="text-xs text-muted-foreground">Reduce el espaciado para mostrar más información</p>
                    </div>
                    <Switch
                        id="compact-mode"
                        checked={settings.compactMode}
                        onCheckedChange={(checked) => updateSetting("compactMode", checked)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="animations">Animaciones</Label>
                        <p className="text-xs text-muted-foreground">Habilita transiciones y animaciones suaves</p>
                    </div>
                    <Switch
                        id="animations"
                        checked={settings.showAnimations}
                        onCheckedChange={(checked) => updateSetting("showAnimations", checked)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="auto-save">Guardado Automático</Label>
                        <p className="text-xs text-muted-foreground">Guarda los cambios automáticamente mientras escribes</p>
                    </div>
                    <Switch
                        id="auto-save"
                        checked={settings.autoSave}
                        onCheckedChange={(checked) => updateSetting("autoSave", checked)}
                    />
                </div>
            </div>

            <Separator />

            {/* Configuraciones de Formato */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="language">Idioma</Label>
                        <Select value={settings.language} onValueChange={(value) => updateSetting("language", value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="es">Español</SelectItem>
                                <SelectItem value="en">English</SelectItem>

                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date-format">Formato de Fecha</Label>
                        <Select value={settings.dateFormat} onValueChange={(value) => updateSetting("dateFormat", value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                                <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="time-format">Formato de Hora</Label>
                    <Select value={settings.timeFormat} onValueChange={(value) => updateSetting("timeFormat", value)}>
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="24h">24 horas (14:30)</SelectItem>
                            <SelectItem value="12h">12 horas (2:30 PM)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Botón para guardar */}
            <div className="flex justify-end pt-4">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors">
                    Guardar Cambios
                </button>
            </div>
        </div>
    )
}
