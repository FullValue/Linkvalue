"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { PublicLinkButton } from "./public-link-button";
import { QrCodeButton } from "./qr-code-button";
import { UserMenu } from "./user-menu";

const tabs = [
  { href: "/dashboard", label: "Builder" },
  { href: "/dashboard/appearance", label: "Appearance" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/contacts", label: "Contacts" },
];

export function DashboardNav({
  username,
  displayName,
  avatarUrl,
}: {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}) {
  const pathname = usePathname();

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-5">
        <Logo href="/dashboard" showWordmark={false} />

        <nav className="bg-secondary/40 flex min-w-0 [scrollbar-width:none] items-center gap-0.5 overflow-x-auto rounded-lg p-0.5 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => {
            const active =
              t.href === "/dashboard" ? pathname === t.href : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-visible:ring-ring shrink-0 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2",
                  active
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <PublicLinkButton username={username} />
          <QrCodeButton username={username} displayName={displayName} />
          <UserMenu username={username} displayName={displayName} avatarUrl={avatarUrl} />
        </div>
      </div>
    </header>
  );
}
