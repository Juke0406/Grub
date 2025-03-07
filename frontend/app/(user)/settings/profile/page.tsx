"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useMobile } from "@/hooks/use-mobile";

export default function ProfileSettingsPage() {
  const isMobile = useMobile();

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <div className={isMobile ? "px-4" : "px-8"}>
        <div className="max-w-[600px] mx-auto py-6">
          <h1 className="text-2xl font-medium mb-6">Profile Settings</h1>

          <div className="bg-background rounded-lg border p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter your full name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
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

              <Button className="w-full">Save Changes</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
