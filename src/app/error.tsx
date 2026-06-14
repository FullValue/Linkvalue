"use client";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <Logo className="mb-10" />
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="text-muted-foreground mt-2 max-w-sm">
        An unexpected error occurred. Try again — if it keeps happening, please come back
        in a little while.
      </p>
      <Button onClick={reset} className="mt-7">
        Try again
      </Button>
    </div>
  );
}
