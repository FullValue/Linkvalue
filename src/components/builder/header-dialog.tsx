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

export function HeaderDialog({
  block,
  onClose,
}: {
  block?: Block;
  onClose: () => void;
}) {
  const { createBlock, updateBlock } = useBuilder();
  const editing = Boolean(block);

  const [open, setOpen] = useState(true);
  const [title, setTitle] = useState(block?.title ?? "");
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
    const res = editing
      ? await updateBlock(block!.id, "header", { title })
      : await createBlock("header", { title });
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
            <DialogTitle>{editing ? "Edit" : "Add"} section header</DialogTitle>
            <DialogDescription>
              A heading to group what follows — e.g. “My projects”.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="h-title">Title</Label>
              <Input
                id="h-title"
                value={title}
                maxLength={80}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My projects"
                autoFocus
              />
              <FieldError messages={errors.title} />
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
