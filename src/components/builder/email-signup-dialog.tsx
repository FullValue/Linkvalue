"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useBuilder } from "./builder-context";
import { readEmailSignupMeta, type SignupFields } from "@/lib/block-content";
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
import { cn } from "@/lib/utils";

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

export function EmailSignupDialog({
  block,
  onClose,
}: {
  block?: Block;
  onClose: () => void;
}) {
  const { createBlock, updateBlock } = useBuilder();
  const editing = Boolean(block);
  const initial = readEmailSignupMeta(block?.meta);

  const [open, setOpen] = useState(true);
  const [heading, setHeading] = useState(initial.heading ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [fields, setFields] = useState<SignupFields>(initial.fields);
  const [buttonLabel, setButtonLabel] = useState(initial.button_label ?? "");
  const [successMessage, setSuccessMessage] = useState(initial.success_message ?? "");
  const [pending, setPending] = useState(false);

  function close(next: boolean) {
    setOpen(next);
    if (!next) window.setTimeout(onClose, 200);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const values = {
      heading,
      description,
      fields,
      button_label: buttonLabel,
      success_message: successMessage,
    };
    const res = editing
      ? await updateBlock(block!.id, "email_signup", values)
      : await createBlock("email_signup", values);
    setPending(false);
    if (res.error || res.fieldErrors) return;
    close(false);
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} signup form</DialogTitle>
            <DialogDescription>
              Collect emails (and optionally phone numbers) right on your page.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="es-heading">Heading (optional)</Label>
              <Input
                id="es-heading"
                value={heading}
                maxLength={120}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="Join my newsletter"
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="es-desc">Description (optional)</Label>
              <Textarea
                id="es-desc"
                value={description}
                maxLength={300}
                rows={2}
                className="resize-none"
                onChange={(e) => setDescription(e.target.value)}
                placeholder="No spam — just the occasional update."
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Label className="font-normal">Collect</Label>
              <Segmented
                value={fields}
                onChange={setFields}
                options={[
                  { value: "email", label: "Email" },
                  { value: "email_phone", label: "Email + phone" },
                ]}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="es-button">Button label (optional)</Label>
              <Input
                id="es-button"
                value={buttonLabel}
                maxLength={40}
                onChange={(e) => setButtonLabel(e.target.value)}
                placeholder="Subscribe"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="es-success">Success message (optional)</Label>
              <Input
                id="es-success"
                value={successMessage}
                maxLength={160}
                onChange={(e) => setSuccessMessage(e.target.value)}
                placeholder="Thanks — you're on the list!"
              />
            </div>

            <p className="text-muted-foreground text-xs leading-relaxed">
              Contacts who submit are saved to your dashboard. Only collect details
              people knowingly give you, and honour your local privacy laws.
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
