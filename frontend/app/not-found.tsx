import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AnimatedShinyText } from "@/components/ui/shiny-text";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <div className="text-center space-y-8">
        <AnimatedShinyText className="text-6xl font-bold">
          404
        </AnimatedShinyText>
        <h2 className="text-2xl font-semibold tracking-tight">Not Found</h2>
        <p className="text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link href="/browse">
        <Button variant="outline" size="lg">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
