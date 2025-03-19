"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMobile } from "@/hooks/use-mobile";
import { usePathname } from "next/navigation";
import React from "react";
import { Toaster } from "sonner";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useMobile();
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const isAuthRoute =
    pathname?.startsWith("/(auth)") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/change-email") ||
    pathname?.startsWith("/email-verified") ||
    pathname?.startsWith("/forget-password") ||
    pathname?.startsWith("/reset-password");

  if (isLandingPage || isAuthRoute) {
    return children;
  }

  return (
    <SidebarProvider>
      <Toaster />
      <AppSidebar />
      <SidebarInset>
        {isMobile ? (
          <>
            <main className="pb-16">{children}</main>
            <MobileNav />
          </>
        ) : (
          <div className="h-full flex-1 rounded-xl">{children}</div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
