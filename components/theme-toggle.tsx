"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// ///////////////////////////////////////////////////////////////////////////
// Custom hook for theme toggle functionality
export const useThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sync isDark state with resolved theme after hydration
  useEffect(() => {
    setIsDark(resolvedTheme === "dark");
    setMounted(true);
  }, [resolvedTheme]);

  const styleId = "theme-transition-styles";

  const updateStyles = useCallback((css: string) => {
    if (typeof window === "undefined") return;

    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = css;
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(!isDark);

    const css = `
       ::view-transition-group(root) {
        animation-duration: 0.7s;
        animation-timing-function: var(--expo-out);
      }
            
      ::view-transition-new(root) {
        animation-name: reveal-light;
      }

      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: none;
        z-index: -1;
      }
      .dark::view-transition-new(root) {
        animation-name: reveal-dark;
      }

      @keyframes reveal-dark {
        from {
          clip-path: circle(0% at 50% 50%);
        }
        to {
          clip-path: circle(100.0% at 50% 50%);
        }
      }

      @keyframes reveal-light {
        from {
           clip-path: circle(0% at 50% 50%);
        }
        to {
          clip-path: circle(100.0% at 50% 50%);
        }
      }
    `;

    updateStyles(css);

    if (typeof window === "undefined") return;

    const switchTheme = () => {
      setTheme(theme === "light" ? "dark" : "light");
    };

    if (!document.startViewTransition) {
      switchTheme();
      return;
    }

    document.startViewTransition(switchTheme);
  }, [theme, setTheme, updateStyles, isDark]);

  return {
    isDark,
    toggleTheme,
    mounted
  };
};

import { Sun, Moon } from "lucide-react";

export const ThemeToggleButton = ({
  className = "",
}: {
  className?: string;
}) => {
  const { isDark, toggleTheme, mounted } = useThemeToggle();

  if (!mounted) {
      return (
          <button
            type="button"
            className={cn(
              "size-10 cursor-pointer rounded-full bg-black p-0 flex items-center justify-center opacity-0",
              className,
            )}
            aria-label="Toggle theme skeleton"
          >
              <div className="w-6 h-6" />
          </button>
      );
  }

  return (
    <button
      type="button"
      className={cn(
        "size-10 cursor-pointer rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-all duration-300 active:scale-95 flex items-center justify-center border border-border",
        className,
      )}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Sun className={cn("absolute inset-0 w-full h-full transition-all duration-300", isDark ? "scale-0 opacity-0 rotate-90" : "scale-100 opacity-100 rotate-0")} />
        <Moon className={cn("absolute inset-0 w-full h-full transition-all duration-300", isDark ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-90")} />
      </div>
    </button>
  );
};
