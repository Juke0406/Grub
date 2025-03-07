"use client";

import { usePortalStore } from "@/lib/store";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const portal = usePortalStore((state) => state.currentPortal);

  useEffect(() => {
    if (portal !== "business") {
      redirect("/");
    }
  }, [portal]);

  return <>{children}</>;
}
