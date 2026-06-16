"use client";

import { useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useBuilder } from "./builder-context";
import { useMediaUpload } from "./use-media-upload";
import { readGalleryMeta, GALLERY_MAX_IMAGES } from "@/lib/gallery";
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

interface Item {
  id: string;
  url: string;
  alt: string;
  link: string;
}

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

function SortableImage({
  item,
  onChange,
  onRemove,
}: {
  item: Item;
  onChange: (patch: Partial<Item>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "bg-card flex items-start gap-2 rounded-xl border p-2",
        isDragging && "border-brand/40 relative z-10 opacity-90 shadow-xl",
      )}
    >
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground mt-6 cursor-grab touch-none rounded-md p-1 outline-none active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.url}
        alt=""
        className="size-16 shrink-0 rounded-lg object-cover"
      />
      <div className="grid min-w-0 flex-1 gap-1.5">
        <Input
          value={item.alt}
          maxLength={120}
          onChange={(e) => onChange({ alt: e.target.value })}
          placeholder="Alt text (for accessibility)"
          className="h-8 text-sm"
        />
        <Input
          value={item.link}
          inputMode="url"
          onChange={(e) => onChange({ link: e.target.value })}
          placeholder="Link on tap (optional)"
          className="h-8 text-sm"
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive size-8 shrink-0"
        onClick={onRemove}
        aria-label="Remove image"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export function GalleryDialog({
  block,
  onClose,
}: {
  block?: Block;
  onClose: () => void;
}) {
  const { userId, createBlock, updateBlock } = useBuilder();
  const { upload, uploading } = useMediaUpload(userId);
  const editing = Boolean(block);
  const initial = readGalleryMeta(block?.meta);

  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(true);
  const [layout, setLayout] = useState<"grid" | "carousel">(initial.layout);
  const [items, setItems] = useState<Item[]>(
    initial.images.map((im) => ({
      id: crypto.randomUUID(),
      url: im.url,
      alt: im.alt ?? "",
      link: im.link ?? "",
    })),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function close(next: boolean) {
    setOpen(next);
    if (!next) window.setTimeout(onClose, 200);
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (inputRef.current) inputRef.current.value = "";
    if (files.length === 0) return;
    const room = GALLERY_MAX_IMAGES - items.length;
    if (room <= 0) {
      toast.error(`Up to ${GALLERY_MAX_IMAGES} images`);
      return;
    }
    for (const file of files.slice(0, room)) {
      const url = await upload(file);
      if (url) {
        setItems((prev) => [
          ...prev,
          { id: crypto.randomUUID(), url, alt: "", link: "" },
        ]);
      }
    }
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((it) => it.id === active.id);
      const newIndex = prev.findIndex((it) => it.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (items.length === 0) {
      setError("Add at least one image");
      return;
    }
    setPending(true);
    const values = {
      layout,
      images: items.map((it) => ({
        url: it.url,
        alt: it.alt.trim() || undefined,
        link: it.link.trim() || undefined,
      })),
    };
    try {
      const res = editing
        ? await updateBlock(block!.id, "gallery", values)
        : await createBlock("gallery", values);
      if (res.fieldErrors) {
        setError(res.fieldErrors.images?.[0] ?? "Please check your images");
        return;
      }
      if (res.error) return;
      close(false);
    } catch {
      toast.error("Something went wrong — please try again");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} gallery</DialogTitle>
            <DialogDescription>
              Upload images and show them as a grid or a swipeable carousel.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Label className="font-normal">Layout</Label>
              <Segmented
                value={layout}
                onChange={setLayout}
                options={[
                  { value: "grid", label: "Grid" },
                  { value: "carousel", label: "Carousel" },
                ]}
              />
            </div>

            {items.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={items.map((it) => it.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-2">
                    {items.map((it) => (
                      <SortableImage
                        key={it.id}
                        item={it}
                        onChange={(patch) =>
                          setItems((prev) =>
                            prev.map((x) => (x.id === it.id ? { ...x, ...patch } : x)),
                          )
                        }
                        onRemove={() =>
                          setItems((prev) => prev.filter((x) => x.id !== it.id))
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : null}

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading || items.length >= GALLERY_MAX_IMAGES}
              className="border-input text-muted-foreground hover:border-foreground/30 hover:text-foreground flex items-center justify-center gap-2 rounded-xl border border-dashed py-6 text-sm transition disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              {uploading
                ? "Uploading…"
                : items.length >= GALLERY_MAX_IMAGES
                  ? `Maximum ${GALLERY_MAX_IMAGES} images`
                  : "Add images"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onFiles}
            />

            {error ? <p className="text-destructive text-xs">{error}</p> : null}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending || uploading} className="gap-2">
              {pending && <Loader2 className="size-4 animate-spin" />}
              {editing ? "Save changes" : "Add block"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
