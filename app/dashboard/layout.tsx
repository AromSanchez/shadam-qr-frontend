import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/dashboard/components/AppSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        
        {/* Sidebar */}
        <AppSidebar />

        {/* Contenido */}
        <div className="flex flex-col flex-1">
          
          {/* Header */}
          <header className="h-16 flex items-center justify-between border-b px-4">
            <SidebarTrigger />
            <span>Header</span>
          </header>

          {/* Contenido dinámico */}
          <main className="flex-1 p-4">
            {children}
          </main>

        </div>
      </div>
    </SidebarProvider>
  );
}