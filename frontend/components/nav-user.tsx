"use client";

import { usePortalStore, type Portal } from "@/lib/store";
import {
  BadgeCheck,
  ChevronDown,
  LogOut,
  Store,
  User,
  type LucideIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const handleLogOut = async () => {
    try {
      await authClient.signOut();
      window.location.reload();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error logging out");
      }
    }
  };

  if (user.name === "Guest") {
    return <Button onClick={() => router.push("/login")}>Log in</Button>;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name
                    .split(" ")
                    .slice(0, 2)
                    .map((word) => word[0].toUpperCase())
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name
                      .split(" ")
                      .slice(0, 2)
                      .map((word) => word[0].toUpperCase())
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  Switch Portal
                </span>
              </DropdownMenuLabel>
              <PortalSwitcher />
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogOut}>
              <LogOut />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function PortalSwitcher() {
  const { currentPortal, setPortal } = usePortalStore();

  const items: { value: Portal; label: string; icon: LucideIcon }[] = [
    {
      value: "user",
      label: "User Portal",
      icon: User,
    },
    {
      value: "business",
      label: "Business Portal",
      icon: Store,
    },
  ];

  return (
    <>
      {items.map(({ value, label, icon: Icon }) => (
        <DropdownMenuItem
          key={value}
          onClick={() => setPortal(value)}
          className="flex items-center gap-2"
        >
          <Icon className="size-4" />
          <span>{label}</span>
          {currentPortal === value && (
            <span className="ml-auto text-accent-foreground">
              <BadgeCheck className="size-4" />
            </span>
          )}
        </DropdownMenuItem>
      ))}
    </>
  );
}
