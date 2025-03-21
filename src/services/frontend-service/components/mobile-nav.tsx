"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMobile } from "@/hooks/use-mobile";
import { authClient } from "@/lib/auth-client";
import { usePortalStore } from "@/lib/store";
import { Apple, BarChart3, ForkKnife, Settings2, Store } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NavUser } from "./nav-user";

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMobile();
  const { currentPortal } = usePortalStore();
  const [user, setUser] = useState({ name: "", email: "", avatar: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: session } = await authClient.getSession();
      setUser({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        avatar: "",
      });
      setLoading(false);
    };

    fetchData();
  }, [pathname]);

  if (!isMobile || loading) return null;

  const userNavItems = [
    {
      href: "/browse",
      icon: Apple,
      label: "Browse Food",
      items: [
        {
          title: "All Items",
          url: "/browse/all",
        },
        {
          title: "Bakeries",
          url: "/browse/bakeries",
        },
        {
          title: "Supermarkets",
          url: "/browse/supermarkets",
        },
      ],
    },
    {
      href: "/reservations",
      icon: ForkKnife,
      label: "Reservations",
      items: [
        {
          title: "Active",
          url: "/reservations/active",
        },
        {
          title: "History",
          url: "/reservations/history",
        },
      ],
    },
    {
      href: "/settings/profile",
      icon: Settings2,
      label: "Settings",
    },
  ];

  const businessNavItems = [
    {
      href: "/business",
      icon: Store,
      label: "Store",
      items: [
        {
          title: "Products",
          url: "/business/products",
        },
        {
          title: "Orders",
          url: "/business/orders",
        },
      ],
    },
    {
      href: "/business/analytics",
      icon: BarChart3,
      label: "Analytics",
    },
    {
      href: "/business/settings/store",
      icon: Settings2,
      label: "Settings",
      items: [
        {
          title: "Store Profile",
          url: "/business/settings/store",
        },
        {
          title: "API Keys",
          url: "/business/api",
        },
      ],
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-lg z-50">
      <nav className="flex items-center px-4 py-2">
        <div className="flex-1 grid grid-cols-3 items-center">
          {(currentPortal === "business" ? businessNavItems : userNavItems).map(
            (item) => {
              const isActive =
                pathname === item.href ||
                (item.items?.some((subItem) => pathname === subItem.url) ??
                  (item.href !== "/business" &&
                    pathname.startsWith(item.href + "/")));
              return item.items ? (
                <DropdownMenu key={item.href}>
                  <DropdownMenuTrigger
                    className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors relative w-full
                      ${
                        isActive
                          ? "text-primary before:absolute before:bottom-0 before:w-1/2 before:h-0.5 before:bg-primary before:rounded-full"
                          : "text-muted-foreground hover:text-primary"
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    align="center"
                    className="min-w-[140px] rounded-lg"
                  >
                    {item.items.map((subItem) => (
                      <DropdownMenuItem
                        key={subItem.url}
                        className="justify-center"
                        onClick={() => router.push(subItem.url)}
                      >
                        {subItem.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors relative w-full
                    ${
                      isActive
                        ? "text-primary before:absolute before:bottom-0 before:w-1/2 before:h-0.5 before:bg-primary before:rounded-full"
                        : "text-muted-foreground hover:text-primary"
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            }
          )}
        </div>
        <div className="w-[72px] flex items-center justify-center">
          <NavUser user={user} variant="mobile" />
        </div>
      </nav>
    </div>
  );
}
