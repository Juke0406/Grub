"use client";

import { useMobile } from "@/hooks/use-mobile";
import { usePortalStore } from "@/lib/store";
import { Apple, BarChart3, ForkKnife, Settings2, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const pathname = usePathname();
  const isMobile = useMobile();
  const { currentPortal } = usePortalStore();

  if (!isMobile) return null;

  const userNavItems = [
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
      href: "/settings",
      icon: Settings2,
      label: "Settings",
    },
  ];

  const businessNavItems = [
    {
      href: "/business",
      icon: Store,
      label: "Store",
    },
    {
      href: "/business/analytics",
      icon: BarChart3,
      label: "Analytics",
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
        {(currentPortal === "business" ? businessNavItems : userNavItems).map(
          (item) => {
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
          }
        )}
      </nav>
    </div>
  );
}
