"use client"

import { useAuthUser } from "@/hooks/use-auth-user"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

interface UserInfoProps {
    showEmail?: boolean
    showAvatar?: boolean
    size?: "sm" | "md" | "lg"
}

export function UserInfo({ showEmail = true, showAvatar = true, size = "md" }: UserInfoProps) {
    const { user, loading } = useAuthUser()

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const sizeClasses = {
        sm: "h-6 w-6",
        md: "h-8 w-8",
        lg: "h-10 w-10",
    }

    if (loading) {
        return (
            <div className="flex items-center gap-2">
                {showAvatar && <Skeleton className={`${sizeClasses[size]} rounded-full`} />}
                <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    {showEmail && <Skeleton className="h-3 w-32" />}
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                {showAvatar && (
                    <Avatar className={sizeClasses[size]}>
                        <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                )}
                <div>
                    <p className="text-sm font-medium">Usuario no encontrado</p>
                    {showEmail && <p className="text-xs text-muted-foreground">Sin email</p>}
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            {showAvatar && (
                <Avatar className={sizeClasses[size]}>
                    {user.avatar ? (
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    ) : (
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    )}
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
            )}
            <div>
                <p className="text-sm font-medium">{user.name}</p>
                {showEmail && <p className="text-xs text-muted-foreground">{user.email}</p>}
            </div>
        </div>
    )
}
