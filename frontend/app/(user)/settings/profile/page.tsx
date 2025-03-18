"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

export default function ProfileSettingsPage() {
  const isMobile = useMobile();
  const [user, setUser] = useState({ name: "", email: "" });
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: session } = await authClient.getSession();
        setUser({
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        });
      } catch {
        console.error("Failed to fetch user");
      }
    }
    fetchUser();
  }, []);

  const handleOnSubmit = async () => {
    if (newEmail) {
      setIsLoading(true);
      try {
        await authClient.changeEmail({
          newEmail: newEmail,
          callbackURL: "/change-email",
        });
      } catch (error) {
        setIsLoading(false);
        toast.error("Error changing email");
      }
      setIsLoading(false);
      toast.success("Profile updated successfully");
    } else if (newName) {
      setIsLoading(true);
      try {
        await authClient.updateUser({
          name: newName,
        });
      } catch (error) {
        setIsLoading(false);
        toast.error("Error updating profile");
      }
      window.location.reload();
      setIsLoading(false);
      toast.success("Profile updated successfully");
    } else if (newPhone) {
      setIsLoading(true);
      try {
        await authClient.updateUser({
          phone: newPhone,
        });
      } catch (error) {
        setIsLoading(false);
        toast.error("Error updating profile");
      }
      window.location.reload();
      setIsLoading(false);
      toast.success("Profile updated successfully");
    } else {
      toast.error("No changes made");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <div className={isMobile ? "px-4" : "px-8"}>
        <div className="max-w-[600px] mx-auto py-6">
          <h1 className="text-2xl font-medium mb-6">Profile Settings</h1>

          <div className="bg-background rounded-lg border p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={user.name} readOnly />
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  onChange={(e) => {
                    setNewName(e.target.value);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email} readOnly />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  onChange={(e) => {
                    setNewPhone(e.target.value);
                  }}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h2 className="text-lg font-medium">Notifications</h2>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about your reservations
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get text messages about pickup reminders
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Separator />

              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoaderCircle className="animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <Button className="w-full" onClick={handleOnSubmit}>
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
