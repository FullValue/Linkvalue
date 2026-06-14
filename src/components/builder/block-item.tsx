"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Link2, Play } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBuilder } from "./builder-context";
import { BlockDialog } from "./block-dialog";
import type { Block } from "@/lib/supabase/types";

export function BlockItem({ block }: { block: Block }) {
  const { toggleBlock, removeBlock } = useBuilder();
  const [editing, setEditing] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const kind = block.type === "embed" ? "embed" : "link";

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "bg-card flex items-center gap-2 rounded-xl border p-2.5",
        isDragging && "border-brand/40 relative z-10 opacity-90 shadow-xl",
        !block.is_active && "opacity-60",
      )}
    >
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground hover:bg-secondary focus-visible:ring-ring -ml-1 cursor-grab touch-none rounded-md p-1.5 outline-none focus-visible:ring-2 active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <div className="bg-secondary text-muted-foreground grid size-9 shrink-0 place-items-center rounded-lg">
        {block.type === "embed" ? (
          <Play className="size-4" />
        ) : (
          <Link2 className="size-4" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{block.title}</p>
        <p className="text-muted-foreground truncate text-xs">{block.url}</p>
      </div>

      <Switch
        checked={block.is_active}
        onCheckedChange={(v) => toggleBlock(block.id, v)}
        aria-label="Toggle visibility"
      />
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={() => setEditing(true)}
        aria-label="Edit"
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive size-8"
        onClick={() => removeBlock(block.id)}
        aria-label="Delete"
      >
        <Trash2 className="size-4" />
      </Button>

      {editing && (
        <BlockDialog kind={kind} block={block} onClose={() => setEditing(false)} />
      )}
    </div>
  );
}
