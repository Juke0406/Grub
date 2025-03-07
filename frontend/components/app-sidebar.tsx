"use client";

import { usePortalStore } from "@/lib/store";
import {
  Apple,
  BarChart3,
  ForkKnife,
  LifeBuoy,
  Send,
  Settings2,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const userData = {
  user: {
    name: "Guest",
    email: "",
    avatar: "",
  },
  navSecondary: [
    {
      title: "Support",
      url: "/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: Send,
    },
  ],
};

const userNavigation = [
  {
    title: "Browse Food",
    url: "/browse",
    icon: Apple,
    isActive: true,
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
    title: "My Reservations",
    url: "/reservations",
    icon: ForkKnife,
    items: [
      {
        title: "Active",
        url: "/reservations/active",
      },
      {
        title: "History",
        url: "/reservations/history",
      },
      {
        title: "Rating History",
        url: "/reservations/ratings",
      },
    ],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings2,
    items: [
      {
        title: "Profile",
        url: "/settings/profile",
      },
      {
        title: "Notifications",
        url: "/settings/notifications",
      },
    ],
  },
];

const businessNavigation = [
  {
    title: "Manage Store",
    url: "/business",
    icon: Store,
    isActive: true,
    items: [
      {
        title: "Inventory",
        url: "/business/inventory",
      },
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
    title: "Analytics",
    url: "/business/analytics",
    icon: BarChart3,
    items: [
      {
        title: "Sales",
        url: "/business/analytics/sales",
      },
      {
        title: "Trends",
        url: "/business/analytics/trends",
      },
      {
        title: "Reports",
        url: "/business/analytics/reports",
      },
    ],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings2,
    items: [
      {
        title: "Store Profile",
        url: "/settings/store",
      },
      {
        title: "Business Hours",
        url: "/settings/hours",
      },
      {
        title: "Notifications",
        url: "/settings/notifications",
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { currentPortal } = usePortalStore();

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white flex aspect-square size-8 items-center justify-center rounded-lg shadow-sm">
                  <UtensilsCrossed className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Grub</span>
                  <span className="truncate text-xs text-muted-foreground/70">
                    {currentPortal === "business"
                      ? "Business Portal"
                      : "Food Rescue"}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={
            currentPortal === "business" ? businessNavigation : userNavigation
          }
        />
        <NavSecondary items={userData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
