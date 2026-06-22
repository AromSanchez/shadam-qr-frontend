"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";

import {
    LayoutDashboard,
    UtensilsCrossed,
    Users,
    ClipboardList,
    DollarSign,
    Grid3X3,
    BarChart3,
    Settings,
} from "lucide-react";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { title: "Productos", icon: ClipboardList, href: "/dashboard/productos" },
    { title: "Menú del Día", icon: UtensilsCrossed, href: "/dashboard/menu" },
    { title: "Pensionistas", icon: Users, href: "/dashboard/pensionistas" },
    { title: "Ventas", icon: DollarSign, href: "/dashboard/ventas" },
    { title: "Reportes", icon: BarChart3, href: "/dashboard/reportes" },
    { title: "Configuración", icon: Settings, href: "/dashboard/configuracion" },
];

import Link from "next/link";

export function AppSidebar() {

    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/dashboard";
        }
        return pathname.startsWith(href); 
    };

    return (
        <Sidebar collapsible="icon" className="border-r border-border bg-background">

            {/* HEADER */}
            <div
                className="
          px-5 py-6 transition-all
          group-data-[collapsible=icon]:opacity-0
          group-data-[collapsible=icon]:invisible
          group-data-[collapsible=icon]:pointer-events-none
        "
            >
                <h1 className="text-xl font-bold text-foreground tracking-wide">
                    Shadam
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                    Gestión de restaurante
                </p>
            </div>

            {/* DIVIDER */}
            <div
                className="
          mx-4 h-px bg-border transition-all
          group-data-[collapsible=icon]:opacity-0
          group-data-[collapsible=icon]:invisible
        "
            />

            {/* CONTENT */}
            <SidebarContent className="pt-5 bg-background">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-2">

                            {items.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            className={cn(
                                                `
          relative flex items-center gap-3 rounded-lg px-3 py-6
          text-[0.95rem] cursor-pointer transition-all
          group-data-[collapsible=icon]:justify-center
          group-data-[collapsible=icon]:px-0
          group-data-[collapsible=icon]:my-2
          `,
                                                active
                                                    ? "bg-primary/10 text-primary font-medium"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                                            )}
                                        >
                                            <Link href={item.href} className="flex items-center gap-3 w-full">
                                                {/* Active Indicator Line */}
                                                {active && (
                                                    <div className="absolute left-0 top-[10%] bottom-[10%] w-[4px] bg-primary rounded-r-md" />
                                                )}

                                                <Icon
                                                    className="
              h-4 w-4 shrink-0 transition-transform
              group-data-[collapsible=icon]:scale-125
            "
                                                />

                                                <span className="group-data-[collapsible=icon]:hidden">
                                                    {item.title}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}