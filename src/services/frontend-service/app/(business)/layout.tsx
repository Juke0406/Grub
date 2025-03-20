import { auth } from "@/lib/auth";
import { createDefaultStore } from "@/lib/store-utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    console.log("[BusinessLayout] Invalid session");
    redirect("/login");
  }

  try {
    await createDefaultStore(session.user.id);
  } catch (error) {
    console.error("[BusinessLayout] Error creating default store:", error);
  }

  return <>{children}</>;
}
