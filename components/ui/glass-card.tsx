import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "solid" | "glass" | "glass-dark";
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "solid", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-3xl p-6 transition-all duration-300",
          {
            "bg-white shadow-xl shadow-slate-200/50 dark:bg-slate-800 dark:shadow-none": variant === "solid",
            "glass-card bg-primary text-white": variant === "glass",
            "bg-secondary text-white shadow-lg": variant === "glass-dark",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
