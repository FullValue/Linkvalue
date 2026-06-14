import Link from "next/link";
import { AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export default function UsernameNotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-brand/15 absolute -top-40 left-1/2 size-[40rem] -translate-x-1/2 rounded-full blur-[120px]" />
      </div>
      <Logo className="mb-10" />
      <div className="bg-brand-muted text-brand grid size-14 place-items-center rounded-2xl">
        <AtSign className="size-7" />
      </div>
      <h1 className="font-heading mt-5 text-2xl font-semibold tracking-tight">
        This handle isn&apos;t taken
      </h1>
      <p className="text-muted-foreground mt-2 max-w-sm">
        No one has claimed this page yet — it could be yours.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/register">Claim your handle</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
