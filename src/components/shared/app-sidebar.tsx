"use client"

import * as React from "react"
import {
    IconCamera,
    IconChartBar,
    IconDashboard,
    IconDatabase,
    IconFileAi,
    IconFileDescription,
    IconFileWord,
    IconFolder,
    IconHelp,
    IconInnerShadowTop,
    IconListDetails,
    IconReport,
    IconSearch,
    IconSettings,
    IconUsers,

} from "@tabler/icons-react"
import { GiEagleHead } from 'react-icons/gi';

// import { NavDocuments } from "@/components/nav-documents"
// import { NavMain } from "@/components/nav-main"
// import { NavSecondary } from "@/components/nav-secondary"
// import { NavUser } from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavDocuments } from "./nav-documents"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import Link from "next/link"
import Image from "next/image";

const data = {
    user: {
        name: "master",
        email: "m@gousa.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "/protected",
            icon: IconDashboard,
        },
        {
            title: "Clientes",
            url: "/protected/customers",
            icon: IconUsers,
        },
        {
            title: "Trámites",
            url: "/protected/tramites",
            icon: IconFolder,
        },
        {
            title: "Citas",
            url: "/protected/citas",
            icon: IconListDetails,
        },
        {
            title: "Servicios Complementarios",
            url: "/protected/servicios-complementarios",
            icon: IconChartBar,
        },
    ],

    navSecondary: [
        {
            title: "Configuraciones",
            url: "/protected/config",
            icon: IconSettings,
        },
        {
            title: "Obtener Ayuda",
            url: "https://wa.me/59177592025?text=Hola,%20necesito%20ayuda%20con%20GO%20USA%20CRM",
            icon: IconHelp,
            external: true,
        },
        // {
        //     title: "Buscar",
        //     url: "#",
        //     icon: IconSearch,
        // },
    ],
    documents: [
        // {
        //     name: "Libreria de Datos",
        //     url: "#",
        //     icon: IconDatabase,
        // },
        // {
        //     name: "Reportes",
        //     url: "#",
        //     icon: IconReport,
        // },
        {
            name: "Asistente de documentos",
            url: "/protected/documentos",
            icon: IconFileWord,
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <Link href="/protected">
                                <Image
                                    src="/gousa.png"
                                    alt="GO USA CRM Logo"
                                    width={30}
                                    height={30}
                                    className="rounded-full"
                                />
                                <span className="text-base font-semibold">GO USA CRM</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavDocuments items={data.documents} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    )
}
