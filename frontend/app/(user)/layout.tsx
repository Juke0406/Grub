import { usePortalStore } from "@/lib/store";
import { redirect } from "next/navigation";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const portal = usePortalStore.getState().currentPortal;

  if (portal !== "user") {
    redirect("/");
  }

  return <>{children}</>;
}
