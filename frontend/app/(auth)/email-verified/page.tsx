"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { CheckCircleIcon } from "lucide-react";

export default function EmailVerifiedPage() {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Email Verified
          </h2>
          <p className="text-sm text-muted-foreground">
            Thank you for verifying your email address.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 py-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-700">
              Your email has been successfully verified.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <a href="/browse/all">Continue to Home</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
