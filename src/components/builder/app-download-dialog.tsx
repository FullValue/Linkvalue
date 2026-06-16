"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useBuilder } from "./builder-context";
import { readAppDownloadMeta } from "@/lib/app-download";
import type { Block } from "@/lib/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FieldError } from "@/components/auth/form-bits";

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="bg-secondary/60 inline-flex rounded-lg p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "focus-visible:ring-ring rounded-md px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2",
            value === o.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function AppDownloadDialog({
  block,
  onClose,
}: {
  block?: Block;
  onClose: () => void;
}) {
  const { createBlock, updateBlock } = useBuilder();
  const editing = Boolean(block);
  const initial = readAppDownloadMeta(block?.meta);

  const [open, setOpen] = useState(true);
  const [heading, setHeading] = useState(initial.heading ?? "");
  const [iosUrl, setIosUrl] = useState(initial.ios_url ?? "");
  const [androidUrl, setAndroidUrl] = useState(initial.android_url ?? "");
  const [displayMode, setDisplayMode] = useState<"auto" | "both">(initial.display_mode);
  const [badgeVariant, setBadgeVariant] = useState<"black" | "white">(
    initial.badge_variant,
  );
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [pending, setPending] = useState(false);

  function close(next: boolean) {
    setOpen(next);
    if (!next) window.setTimeout(onClose, 200);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    const values = {
      heading,
      ios_url: iosUrl,
      android_url: androidUrl,
      display_mode: displayMode,
      badge_variant: badgeVariant,
    };
    const res = editing
      ? await updateBlock(block!.id, "app_download", values)
      : await createBlock("app_download", values);
    setPending(false);
    if (res.fieldErrors) return setErrors(res.fieldErrors);
    if (res.error) return;
    close(false);
  }

  const appStoreSrc =
    badgeVariant === "white" ? "/badges/app-store-white.svg" : "/badges/app-store.svg";

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} app download</DialogTitle>
            <DialogDescription>
              Show official App Store / Google Play badges. The visitor’s device
              decides which one to highlight.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ad-heading">Heading (optional)</Label>
              <Input
                id="ad-heading"
                value={heading}
                maxLength={120}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="Get the app"
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ad-ios">App Store URL</Label>
              <Input
                id="ad-ios"
                value={iosUrl}
                inputMode="url"
                onChange={(e) => setIosUrl(e.target.value)}
                placeholder="https://apps.apple.com/app/…"
              />
              <FieldError messages={errors.ios_url} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ad-android">Google Play URL</Label>
              <Input
                id="ad-android"
                value={androidUrl}
                inputMode="url"
                onChange={(e) => setAndroidUrl(e.target.value)}
                placeholder="https://play.google.com/store/apps/details?id=…"
              />
              <FieldError messages={errors.android_url} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Label className="font-normal">Display</Label>
              <Segmented
                value={displayMode}
                onChange={setDisplayMode}
                options={[
                  { value: "auto", label: "Auto (detect)" },
                  { value: "both", label: "Always both" },
                ]}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Label className="font-normal">Badge style</Label>
              <Segmented
                value={badgeVariant}
                onChange={setBadgeVariant}
                options={[
                  { value: "black", label: "Black" },
                  { value: "white", label: "White" },
                ]}
              />
            </div>

            {(iosUrl || androidUrl) && (
              <div
                className={cn(
                  "flex flex-wrap items-center justify-center gap-3 rounded-xl border p-4",
                  badgeVariant === "white" ? "bg-zinc-900" : "bg-secondary/40",
                )}
              >
                {iosUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={appStoreSrc} alt="App Store badge preview" className="h-10" />
                )}
                {androidUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src="/badges/google-play.svg"
                    alt="Google Play badge preview"
                    className="h-10"
                  />
                )}
              </div>
            )}

            <p className="text-muted-foreground text-xs leading-relaxed">
              The App Store and Google Play badges are trademarks of Apple Inc. and
              Google LLC. They’re shown as official, unmodified assets and must not be
              altered.
            </p>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending} className="gap-2">
              {pending && <Loader2 className="size-4 animate-spin" />}
              {editing ? "Save changes" : "Add block"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
