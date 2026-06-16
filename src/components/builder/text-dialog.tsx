"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useBuilder } from "./builder-context";
import { readTextMeta } from "@/lib/block-content";
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
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/auth/form-bits";

export function TextDialog({
  block,
  onClose,
}: {
  block?: Block;
  onClose: () => void;
}) {
  const { createBlock, updateBlock } = useBuilder();
  const editing = Boolean(block);

  const [open, setOpen] = useState(true);
  const [heading, setHeading] = useState(block?.title ?? "");
  const [body, setBody] = useState(readTextMeta(block?.meta).body ?? "");
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
    const values = { heading, body };
    const res = editing
      ? await updateBlock(block!.id, "text", values)
      : await createBlock("text", values);
    setPending(false);
    if (res.fieldErrors) return setErrors(res.fieldErrors);
    if (res.error) return;
    close(false);
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} text</DialogTitle>
            <DialogDescription>
              A short block of text — add context between your links.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="t-heading">Heading (optional)</Label>
              <Input
                id="t-heading"
                value={heading}
                maxLength={120}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="About me"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="t-body">Text</Label>
              <Textarea
                id="t-body"
                value={body}
                maxLength={2000}
                rows={5}
                className="resize-none"
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write something…"
              />
              <FieldError messages={errors.body} />
            </div>
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
