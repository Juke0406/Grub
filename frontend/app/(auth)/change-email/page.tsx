"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { CheckCircleIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect } from "react";

const EmailVerifiedPage: React.FC = () => {
  useEffect(() => {}, []);
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Email Changed!
          </h2>
          <p className="text-sm text-muted-foreground">
            Your email account has been successfully updated.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 py-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/browse/all">Back to Home Page</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmailVerifiedPage;
