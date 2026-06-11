"use client";

import { usePathname } from "next/navigation";
import { PensionerProvider } from "./context";
import Link from "next/link";
import { Home, QrCode, History, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

function PensionistaBottomNav() {
  const pathname = usePathname();

  const tabs = [
    { id: "home", label: "Inicio", icon: Home, href: "/pensionista" },
    { id: "qr", label: "Mi QR", icon: QrCode, href: "/pensionista/qr" },
    { id: "consumo", label: "Historial", icon: History, href: "/pensionista/consumo" },
    { id: "profile", label: "Perfil", icon: User, href: "/pensionista/profile" },
  ];

  const getActiveTab = () => {
    if (pathname === "/pensionista") return "home";
    if (pathname === "/pensionista/qr") return "qr";
    if (pathname === "/pensionista/consumo") return "consumo";
    if (pathname === "/pensionista/profile") return "profile";
    return "home";
  };

  const activeTab = getActiveTab();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className="flex flex-col items-center justify-center w-16 h-full relative group"
            >
              <Icon
                className={cn(
                  "w-5 h-5 mb-1 transition-colors",
                  isActive ? "text-cyan-500" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  "text-[10px] font-semibold transition-colors",
                  isActive ? "text-cyan-500" : "text-slate-400 dark:text-slate-500"
                )}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="pensionista-nav-indicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-cyan-500 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function PensionistaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/pensionista/login";
  const isOnboardingPage = pathname === "/pensionista/onboarding";
  const hideNav = isLoginPage || isOnboardingPage;

  if (hideNav) {
    return <>{children}</>;
  }

  return (
    <PensionerProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] pb-20">
        {children}
      </div>
      <PensionistaBottomNav />
    </PensionerProvider>
  );
}
