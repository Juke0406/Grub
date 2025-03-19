"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

interface FormData {
  email: string;
  password: string;
  username: string;
}

export default function SignUpPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    username: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authClient.signUp.email(
        {
          email: formData.email,
          password: formData.password,
          name: formData.username,
        },
        {
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: () => {
            setIsLoading(false);
            toast.success("Account created successfully");
            router.push("/browse/all");
            router.refresh();
          },
          onError: (ctx) => {
            setIsLoading(false);
            toast.error("Error creating account", {
              description: ctx.error.message,
            });
          },
        }
      );
    } catch (error) {}
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <form onSubmit={handleSubmit} className="p-6 md:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-medium">Welcome</h1>
                    <p className="text-muted-foreground text-balance">
                      Create a Grub account
                    </p>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="email">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="John Doe"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="m@example.com"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <LoaderCircle className="animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                  <div className="text-center text-sm">
                    Already have an account?{" "}
                    <a href="login" className="underline underline-offset-4">
                      Login
                    </a>
                  </div>
                </div>
              </form>
              <div className="bg-muted relative hidden md:block">
                <img
                  src="https://images.unsplash.com/photo-1556742059-47b93231f536?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Image"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>
            </CardContent>
          </Card>
          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
