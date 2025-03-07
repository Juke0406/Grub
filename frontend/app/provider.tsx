"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMobile } from "@/hooks/use-mobile";
import { usePathname } from "next/navigation";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useMobile();
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return children;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {isMobile ? (
          <>
            <main className="pb-16">{children}</main>
            <MobileNav />
          </>
        ) : (
          <div className="h-full flex-1 bg-muted rounded-xl">{children}</div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
