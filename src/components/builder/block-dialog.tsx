"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useBuilder } from "./builder-context";
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
import { FieldError } from "@/components/auth/form-bits";

type Kind = "link" | "embed";

export function BlockDialog({
  kind,
  block,
  onClose,
}: {
  kind: Kind;
  block?: Block;
  onClose: () => void;
}) {
  const { createBlock, updateBlock } = useBuilder();
  const editing = Boolean(block);

  const [open, setOpen] = useState(true);
  const [title, setTitle] = useState(block?.title ?? "");
  const [url, setUrl] = useState(block?.url ?? "");
  const [icon, setIcon] = useState(block?.icon ?? "");
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
    const values = kind === "link" ? { title, url, icon } : { url, title };
    const res = editing
      ? await updateBlock(block!.id, kind, values)
      : await createBlock(kind, values);
    setPending(false);
    if (res.fieldErrors) return setErrors(res.fieldErrors);
    if (res.error) return;
    close(false);
  }

  const verb = editing ? "Save changes" : "Add block";

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit" : "Add"} {kind === "embed" ? "embed" : "link"}
            </DialogTitle>
            <DialogDescription>
              {kind === "embed"
                ? "Paste a YouTube or Spotify link — it plays right on your page."
                : "Add a title and the URL it points to."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {kind === "link" ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="b-title">Title</Label>
                  <Input
                    id="b-title"
                    value={title}
                    maxLength={120}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My portfolio"
                    autoFocus
                  />
                  <FieldError messages={errors.title} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="b-url">URL</Label>
                  <Input
                    id="b-url"
                    value={url}
                    inputMode="url"
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                  <FieldError messages={errors.url} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="b-icon">Icon (optional)</Label>
                  <Input
                    id="b-icon"
                    value={icon}
                    maxLength={8}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="✨ an emoji"
                    className="w-28"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="b-url">YouTube or Spotify URL</Label>
                  <Input
                    id="b-url"
                    value={url}
                    inputMode="url"
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://youtu.be/…"
                    autoFocus
                  />
                  <FieldError messages={errors.url} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="b-title">Label (optional)</Label>
                  <Input
                    id="b-title"
                    value={title}
                    maxLength={120}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My latest video"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending} className="gap-2">
              {pending && <Loader2 className="size-4 animate-spin" />}
              {verb}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
