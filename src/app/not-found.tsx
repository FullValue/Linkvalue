import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-brand/15 absolute -top-40 left-1/2 size-[40rem] -translate-x-1/2 rounded-full blur-[120px]" />
      </div>
      <Logo className="mb-10" />
      <p className="text-gradient font-heading text-7xl font-semibold">404</p>
      <h1 className="font-heading mt-3 text-2xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="text-muted-foreground mt-2 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
