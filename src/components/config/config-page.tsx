"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ThemeCustomizer } from "./theme-customizer"
import { PersonalizationSettings } from "./personalization-settings"
import { WhatsAppHelpButton } from "./whatsapp-help-button"
import { DatabaseStatus } from "./database-status"

export default function ConfigPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Configuración</h1>
                <p className="text-muted-foreground">Personaliza tu experiencia en GO USA CRM</p>
            </div>

            <div className="grid gap-6">
                {/* Personalización */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personalización</CardTitle>
                        <CardDescription>Ajusta la apariencia y el comportamiento de la aplicación</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium mb-4">Tema</h3>
                            <ThemeCustomizer />
                        </div>

                        <Separator />

                        {/* <div>
                            <h3 className="text-lg font-medium mb-4">Preferencias</h3>
                            <PersonalizationSettings />
                        </div> */}
                    </CardContent>
                </Card>

                {/* Configuración de Cuenta */}
                {/* <Card>
                    <CardHeader>
                        <CardTitle>Configuración de Cuenta</CardTitle>
                        <CardDescription>Gestiona tu perfil y preferencias de cuenta</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Perfil de Usuario</p>
                                <p className="text-sm text-muted-foreground">Actualiza tu información personal</p>
                            </div>
                            <button className="text-sm text-primary hover:underline">Editar</button>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Notificaciones</p>
                                <p className="text-sm text-muted-foreground">Configura cómo recibes las notificaciones</p>
                            </div>
                            <button className="text-sm text-primary hover:underline">Configurar</button>
                        </div>
                    </CardContent>
                </Card> */}

                {/* Soporte y Ayuda */}
                <Card>
                    <CardHeader>
                        <CardTitle>Soporte y Ayuda</CardTitle>
                        <CardDescription>¿Necesitas ayuda? Contáctanos directamente</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Soporte Técnico</p>
                                <p className="text-sm text-muted-foreground">Obtén ayuda inmediata por WhatsApp</p>
                            </div>
                            <WhatsAppHelpButton />
                        </div>

                        {/* <Separator />

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Documentación</p>
                                <p className="text-sm text-muted-foreground">Guías y tutoriales del sistema</p>
                            </div>
                            <button className="text-sm text-primary hover:underline">Ver docs</button>
                        </div> */}
                    </CardContent>
                </Card>

                {/* Configuración del Sistema */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sistema</CardTitle>
                        <CardDescription>Configuraciones avanzadas del sistema</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Base de Datos</p>
                                <p className="text-sm text-muted-foreground">Estado de la conexión y configuración</p>
                            </div>
                            <DatabaseStatus />
                            {/* <div className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-muted-foreground">Conectado</span>
                            </div> */}
                        </div>

                        {/* <Separator />

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Respaldo de Datos</p>
                                <p className="text-sm text-muted-foreground">Último respaldo: Sin respaldos</p>
                            </div>
                            <button className="text-sm text-primary hover:underline">Ver detalles</button>
                        </div> */}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
