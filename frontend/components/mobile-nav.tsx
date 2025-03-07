"use client";

import { useMobile } from "@/hooks/use-mobile";
import { Apple, ForkKnife, History, Settings2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const pathname = usePathname();
  const isMobile = useMobile();

  if (!isMobile) return null;

  const navItems = [
    {
      href: "/browse",
      icon: Apple,
      label: "Browse Food",
    },
    {
      href: "/reservations",
      icon: ForkKnife,
      label: "Reservations",
    },
    {
      href: "/business",
      icon: History,
      label: "Business",
    },
    {
      href: "/settings",
      icon: Settings2,
      label: "Settings",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-lg z-50">
      <nav className="flex justify-between px-4 py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 min-w-[64px] py-2 rounded-lg transition-colors
                ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
