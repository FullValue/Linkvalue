"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
      <div className="bg-destructive/10 text-destructive grid size-12 place-items-center rounded-xl">
        <TriangleAlert className="size-6" />
      </div>
      <h2 className="font-heading mt-4 text-lg font-semibold tracking-tight">
        Couldn&apos;t load this page
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Something went wrong. Please try again.
      </p>
      <Button onClick={reset} variant="outline" className="mt-5">
        Retry
      </Button>
    </div>
  );
}
