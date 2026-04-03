"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type SidebarProps = {
  className?: string;
};

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "space-y-2 border-r border-paradox-gray-800/80 bg-paradox-surface px-4 py-6 text-sm font-semibold text-white",
        className,
      )}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-paradox-gray-400">
        Phantom Studio
      </p>
      <div className="space-y-1 pt-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              href={item.href}
              key={item.href}
              className={cn(
                "block rounded-2xl px-3 py-2 transition hover:bg-white/5",
                active
                  ? "bg-paradox-gray-700 text-white shadow-lg shadow-black/40"
                  : "text-paradox-gray-300",
              )}
            >
              <span className="flex items-center justify-between text-sm">
                <span>{item.label}</span>
                <span className="text-xs text-paradox-gray-400">{item.icon}</span>
              </span>
              <p className="text-xs font-light text-paradox-gray-400">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
