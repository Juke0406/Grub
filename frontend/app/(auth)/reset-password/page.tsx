"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      toast.error("Token is missing");
    }
  }, [token]);

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setIsLoading(false);
      toast("Passwords do not match");
      return;
    }

    setIsLoading(true);
    const { error } = await authClient.resetPassword({
      newPassword: newPassword,
      token: searchParams.get("token") || "",
    });
    if (error) {
      setIsLoading(false);
      console.log(error);
      toast.error("Error resetting password", {
        description: error.message,
      });
    } else {
      setIsLoading(false);
      router.push("/login");
      toast.success("Password reset successfully");
    }
  };

  if (error === "invalid_token") {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Invalid Token
            </h2>
            <p className="text-sm text-muted-foreground">
              The reset password token is invalid or has expired.
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleOnSubmit}>
          <CardHeader className="text-center space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Reset Your Password
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your new password below.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                placeholder="Enter new password"
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                placeholder="Confirm new password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0 justify-end">
            <Button type="submit" className="flex justify-center items-center">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoaderCircle className="animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                "Reset Password"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
