
"use client"

import type React from "react"

import type { Icon } from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
    items,
    ...props
}: {
    items: {
        title: string
        url: string
        icon?: Icon
        external?: boolean // Nueva propiedad para enlaces externos
    }[]
} & React.ComponentProps<typeof SidebarGroup>) {
    const pathname = usePathname()

    return (
        <SidebarGroup {...props}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const isActive = !item.external && pathname === item.url

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton tooltip={item.title} asChild isActive={isActive}>
                                    {item.external ? (
                                        // Para enlaces externos (como WhatsApp)
                                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </a>
                                    ) : (
                                        // Para enlaces internos
                                        <Link href={item.url}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
