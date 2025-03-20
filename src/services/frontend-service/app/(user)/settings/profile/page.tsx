"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useMobile } from "@/hooks/use-mobile";
import { authClient } from "@/lib/auth-client";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UserProfile {
  name: string;
  email: string;
  phoneNumber?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
}

interface SessionUser extends UserProfile {
  id: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
}

export default function ProfileSettingsPage() {
  const isMobile = useMobile();
  const [user, setUser] = useState<UserProfile>({
    name: "",
    email: "",
    phoneNumber: "",
    emailNotifications: true,
    smsNotifications: true,
  });
  const [formData, setFormData] = useState<UserProfile>({
    name: "",
    email: "",
    phoneNumber: "",
    emailNotifications: true,
    smsNotifications: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: session } = await authClient.getSession();
        const user = session?.user as SessionUser;
        const userData: UserProfile = {
          name: user?.name || "",
          email: user?.email || "",
          phoneNumber: user?.phoneNumber || "",
          emailNotifications: user?.emailNotifications ?? true,
          smsNotifications: user?.smsNotifications ?? true,
        };
        setUser(userData);
        setFormData(userData);
      } catch (error) {
        console.error("Failed to fetch user", error);
        toast.error("Failed to load profile data");
      }
    }
    fetchUser();
  }, []);

  const handleOnSubmit = async () => {
    if (JSON.stringify(user) === JSON.stringify(formData)) {
      toast.info("No changes to save");
      return;
    }

    setIsLoading(true);
    try {
      // Handle email change separately as it requires special flow
      if (formData.email !== user.email) {
        await authClient.changeEmail({
          newEmail: formData.email,
          callbackURL: "/change-email",
        });
      }

      // Handle other updates
      const updates = {
        name: formData.name !== user.name ? formData.name : undefined,
        phoneNumber:
          formData.phoneNumber !== user.phoneNumber
            ? formData.phoneNumber
            : undefined,
        emailNotifications:
          formData.emailNotifications !== user.emailNotifications
            ? formData.emailNotifications
            : undefined,
        smsNotifications:
          formData.smsNotifications !== user.smsNotifications
            ? formData.smsNotifications
            : undefined,
      };

      // Only call updateUser if there are non-email changes
      if (Object.values(updates).some((val) => val !== undefined)) {
        await authClient.updateUser(updates);
      }

      toast.success("Profile updated successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen justify-center items-center">
      <div className={isMobile ? "px-4" : "px-8"}>
        <div className="max-w-[600px] py-6">
          <h1 className="text-2xl font-medium mb-6">Profile Settings</h1>

          <div className="bg-background rounded-lg border p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  placeholder="Enter your phone number"
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
                  <Switch
                    checked={formData.emailNotifications}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        emailNotifications: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get text messages about pickup reminders
                    </p>
                  </div>
                  <Switch
                    checked={formData.smsNotifications}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        smsNotifications: checked,
                      }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <Button
                className="w-full"
                onClick={handleOnSubmit}
                disabled={
                  isLoading || JSON.stringify(user) === JSON.stringify(formData)
                }
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
