"use client";

import { useState } from "react";
import { LoginModal } from "@/components/ui/login-modal";

export default function LoginPage() {
  const [show, setShow] = useState(true);
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
      <LoginModal isOpen={show} onClose={() => setShow(false)} />
    </div>
  );
}
