"use client";

import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2";
    const variantClasses: Record<string, string> = {
      primary:
        "bg-paradox-accent text-white shadow-lg shadow-paradox-accent/30 hover:bg-paradox-emerald",
      outline: "border border-paradox-accent text-paradox-accent hover:bg-paradox-accent/10",
      ghost: "bg-transparent text-white hover:bg-white/5",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variantClasses[variant], className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
