"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  variant?: "default" | "destructive";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card p-5 border transition-all duration-200",
        "hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between">
        {/* TEXT */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>

          <p
            className={cn(
              "text-2xl font-bold",
              variant === "destructive"
                ? "text-destructive"
                : "text-foreground"
            )}
          >
            {value}
          </p>

          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}

          {trend && (
            <p
              className={cn(
                "text-xs font-medium flex items-center gap-1",
                trend.positive ? "text-green-600" : "text-destructive"
              )}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>

        {/* ICON */}
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            variant === "destructive"
              ? "bg-destructive/10"
              : "bg-primary/10"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              variant === "destructive"
                ? "text-destructive"
                : "text-primary"
            )}
          />
        </div>
      </div>
    </div>
  );
}