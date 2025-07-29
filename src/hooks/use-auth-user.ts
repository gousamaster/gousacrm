"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface AuthUser {
    id: string
    email: string
    name: string
    avatar?: string
}

export function useAuthUser() {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const supabase = createClient()

        const getUser = async () => {
            try {
                setLoading(true)
                setError(null)

                // Obtener el usuario actual
                const {
                    data: { user: authUser },
                    error: authError,
                } = await supabase.auth.getUser()

                if (authError) {
                    throw authError
                }

                if (authUser) {
                    // Extraer información del usuario
                    const userData: AuthUser = {
                        id: authUser.id,
                        email: authUser.email || "Sin email",
                        name:
                            authUser.user_metadata?.full_name ||
                            authUser.user_metadata?.name ||
                            authUser.email?.split("@")[0] ||
                            "Usuario",
                        avatar: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
                    }

                    setUser(userData)
                } else {
                    setUser(null)
                }
            } catch (err) {
                console.error("Error obteniendo usuario:", err)
                setError(err instanceof Error ? err.message : "Error desconocido")
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        // Obtener usuario inicial
        getUser()

        // Escuchar cambios en la autenticación
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_IN" && session?.user) {
                const userData: AuthUser = {
                    id: session.user.id,
                    email: session.user.email || "Sin email",
                    name:
                        session.user.user_metadata?.full_name ||
                        session.user.user_metadata?.name ||
                        session.user.email?.split("@")[0] ||
                        "Usuario",
                    avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
                }
                setUser(userData)
            } else if (event === "SIGNED_OUT") {
                setUser(null)
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    return { user, loading, error }
}
