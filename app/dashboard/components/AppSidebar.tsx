"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();

  const items = [
    { title: "Dashboard", url: "/dashboard" },
    { title: "Menú", url: "/dashboard/menu" },
    { title: "Ventas", url: "/dashboard/ventas" },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.url}>
                    {item.title}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}