import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

/** The four-point "luminous spark" mark. */
function Spark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 1.5c.4 4.6 2.9 7.1 7.5 7.5v6c-4.6.4-7.1 2.9-7.5 7.5h-1.5c-.4-4.6-2.9-7.1-7.5-7.5v-6c4.6-.4 7.1-2.9 7.5-7.5h1.5Z" />
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
  showWordmark = true,
}: {
  className?: string;
  href?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group focus-visible:ring-ring focus-visible:ring-offset-background inline-flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        className,
      )}
      aria-label={siteConfig.name}
    >
      <span className="bg-brand text-brand-foreground relative grid size-7 place-items-center rounded-lg">
        <span
          aria-hidden
          className="bg-brand absolute inset-0 rounded-lg opacity-50 blur-md transition-opacity duration-300 group-hover:opacity-90"
        />
        <Spark className="relative size-4" />
      </span>
      {showWordmark && (
        <span className="font-heading text-lg font-semibold tracking-tight">
          {siteConfig.name}
        </span>
      )}
    </Link>
  );
}
