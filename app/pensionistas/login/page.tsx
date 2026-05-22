"use client";

import { useState } from "react";
import { LoginModal } from "@/components/ui/login-modal";

export default function PensionistaLoginPage() {
  const [show, setShow] = useState(true);
  return (
    <div className="min-h-screen bg-[#060913] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Optional background glow effects */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      <LoginModal isOpen={show} onClose={() => setShow(false)} />
    </div>
  );
}
