"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "./components/AppSidebar";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">

          {/* Sidebar */}
          <AppSidebar />

          {/* Content */}
          <div className="flex flex-col flex-1">

            {/* Header */}
            <header className="h-16 flex items-center justify-between border-b px-4">
              <SidebarTrigger />
              <span>Admin</span>
            </header>

            {/* Page */}
            <main className="flex-1 p-4">
              {children}
              <Toaster richColors position="top-right" />
            </main>

          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}