"use client"

import {
    LayoutDashboard,
    Package,
    Image as ImageIcon,
    ShoppingCart,
    Home,
    LogOut,
    User
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const items = [
    {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Productos",
        url: "/admin/products",
        icon: Package,
    },
    {
        title: "Visuales",
        url: "/admin/visuals",
        icon: ImageIcon,
    },
    {
        title: "Ordenes",
        url: "/admin/orders",
        icon: ShoppingCart,
    },
]

export function AppSidebar() {
    const { user, logout } = useAuth()
    const pathname = usePathname()

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-1">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Package className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-semibold">4Fun Admin</span>
                        <span className="truncate text-xs">Panel de Control</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Gestión</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.url || pathname.startsWith(item.url + '/')} className="h-10 lg:h-12">
                                        <Link href={item.url} className="flex items-center gap-3">
                                            <item.icon className="!h-5 !w-5 lg:!h-6 lg:!w-6" />
                                            <span className="text-base lg:text-lg">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-auto">
                    <SidebarGroupLabel>Tienda</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/" className="flex items-center gap-3">
                                        <Home className="!h-5 !w-5 lg:!h-6 lg:!w-6" />
                                        <span className="text-base lg:text-lg">Volver a la Tienda</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:hidden">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{user?.name?.[0] || "A"}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user?.name}</span>
                                <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => logout()} title="Cerrar Sesión">
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                        {/* Fallback icon for collapsed state */}
                        <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center p-2">
                            <Button variant="ghost" size="icon" onClick={() => logout()} title="Cerrar Sesión">
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
