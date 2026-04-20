import { cn } from "@/lib/utils";
import React from "react";
import Image from "next/image";
import { Bell } from "lucide-react";
import { Badge } from "./badge";

interface HeaderProps {
  name: string;
  isPensionista?: boolean;
  avatarUrl?: string;
  hasNotification?: boolean;
}

export function Header({ name, isPensionista, avatarUrl, hasNotification }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-6 bg-transparent">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "relative w-12 h-12 rounded-full p-[2px] overflow-hidden",
            isPensionista ? "bg-gradient-to-tr from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/30" : "bg-slate-200 dark:bg-slate-700"
          )}
        >
          <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-900 overflow-hidden flex items-center justify-center text-primary font-bold">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={name} fill className="object-cover" />
            ) : (
              name.charAt(0)
            )}
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-500 dark:from-white dark:to-slate-300">
            Buen provecho,
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-slate-800 dark:text-white">
              {name.split(" ")[0]} 👋
            </span>
            {isPensionista && <Badge variant="secondary" className="scale-75 origin-left">PREMIUM</Badge>}
          </div>
        </div>
      </div>
      <button className="relative p-2 rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
        <Bell className="w-6 h-6" />
        {hasNotification && (
          <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white dark:border-slate-900" />
        )}
      </button>
    </header>
  );
}
