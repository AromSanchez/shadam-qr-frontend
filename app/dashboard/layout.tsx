"use client";

import { Inter } from "next/font/google";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "./components/AppSidebar";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className={`${inter.className} flex min-h-screen w-full`}>

          {/* Sidebar */}
          <AppSidebar />

          {/* Content */}
          <div className="flex flex-col flex-1">

            {/* Header */}
            <header className="sticky top-0 z-40 h-16 flex items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm">
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