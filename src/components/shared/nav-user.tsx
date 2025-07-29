"use client"

import { IconDotsVertical, IconLogout, IconNotification, IconUserCircle } from "@tabler/icons-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

// Importaciones de Next.js
import { useRouter } from "next/navigation"

// Importación del cliente de Supabase
import { createClient } from "@/lib/supabase/client"
import { useAuthUser } from "@/hooks/use-auth-user"

export function NavUser() {
    const { isMobile } = useSidebar()
    const router = useRouter()
    const { user, loading, error } = useAuthUser()

    // Función para manejar el logout
    const handleLogout = async () => {
        const supabase = createClient()

        // Cerrar sesión en Supabase
        await supabase.auth.signOut()

        // Redireccionar al login
        router.push("/auth/login")
    }

    // Función para obtener las iniciales del nombre
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    // Mostrar skeleton mientras carga
    if (loading) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" disabled>
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-4 w-4" />
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    // Si hay error o no hay usuario, mostrar estado de error
    if (error || !user) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" disabled>
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarFallback className="rounded-lg">?</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">Error</span>
                            <span className="text-muted-foreground truncate text-xs">{error || "Usuario no encontrado"}</span>
                        </div>
                        <IconDotsVertical className="ml-auto size-4" />
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                {user.avatar ? (
                                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                ) : (
                                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                )}
                                <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user.name}</span>
                                <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                            </div>
                            <IconDotsVertical className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        {/* Header del dropdown con información del usuario */}
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    {user.avatar ? (
                                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                    ) : (
                                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                    )}
                                    <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user.name}</span>
                                    <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        {/* Grupo de opciones de cuenta */}
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <IconUserCircle />
                                Cuenta
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <IconNotification />
                                Notificaciones
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        {/* Opción de logout con funcionalidad */}
                        <DropdownMenuItem onClick={handleLogout}>
                            <IconLogout />
                            Salir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
