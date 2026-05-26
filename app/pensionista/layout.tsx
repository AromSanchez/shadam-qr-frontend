"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/ui/bottom-nav";

export default function PensionistaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/pensionista/login";

  return (
    <>
      {children}
      {!isLoginPage && <BottomNav />}
    </>
  );
}
