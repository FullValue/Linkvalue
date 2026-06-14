"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useBuilder } from "./builder-context";
import { SOCIAL_PLATFORMS, SOCIAL_MAP, type SocialPlatform } from "@/lib/socials";
import { SocialIcon } from "@/components/icons/social-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function SocialEditor() {
  const { blocks, createBlock, removeBlock } = useBuilder();
  const socials = blocks
    .filter((b) => b.type === "social")
    .sort((a, b) => a.position - b.position);

  const [platform, setPlatform] = useState<SocialPlatform>("instagram");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function add() {
    setPending(true);
    setError(null);
    const res = await createBlock("social", { platform, url });
    setPending(false);
    if (res.fieldErrors?.url) return setError(res.fieldErrors.url[0] ?? "Invalid");
    if (res.error) return;
    setUrl("");
  }

  return (
    <section className="bg-card rounded-2xl border p-5">
      <h2 className="font-heading text-sm font-semibold tracking-tight">Social icons</h2>
      <p className="text-muted-foreground text-xs">
        A row of icons shown near the top of your page.
      </p>

      {socials.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2">
          {socials.map((s) => {
            const plat = ((s.meta as { platform?: SocialPlatform } | null)?.platform ??
              "website") as SocialPlatform;
            return (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-lg border p-2 pl-3"
              >
                <SocialIcon platform={plat} className="size-4 shrink-0" />
                <span className="text-muted-foreground min-w-0 flex-1 truncate text-sm">
                  {s.url}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive size-8"
                  onClick={() => removeBlock(s.id)}
                  aria-label="Remove"
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Select value={platform} onValueChange={(v) => setPlatform(v as SocialPlatform)}>
          <SelectTrigger className="sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SOCIAL_PLATFORMS.map((p) => (
              <SelectItem key={p.key} value={p.key}>
                <SocialIcon platform={p.key} className="size-4" />
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-1 gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={SOCIAL_MAP[platform].placeholder}
            onKeyDown={(e) => {
              if (e.key === "Enter" && url.trim()) {
                e.preventDefault();
                add();
              }
            }}
          />
          <Button
            onClick={add}
            disabled={pending || !url.trim()}
            size="icon"
            aria-label="Add social"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
          </Button>
        </div>
      </div>
      {error ? <p className="text-destructive mt-2 text-xs">{error}</p> : null}
    </section>
  );
}
