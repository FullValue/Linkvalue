"use client";

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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import { Link2 } from "lucide-react";
import { useBuilder } from "./builder-context";
import { BlockItem } from "./block-item";
import { AddBlock } from "./add-block";
import { isContentBlock } from "./block-types";
import { EmptyState } from "@/components/dashboard/empty-state";

export function BlockList() {
  const { blocks, reorder } = useBuilder();
  const content = blocks
    .filter((b) => isContentBlock(b.type))
    .sort((a, b) => a.position - b.position);
  const ids = content.map((b) => b.id);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    reorder(arrayMove(ids, oldIndex, newIndex));
  }

  return (
    <section className="bg-card rounded-2xl border p-5">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-sm font-semibold tracking-tight">Blocks</h2>
          <p className="text-muted-foreground text-xs">
            Drag to reorder. Toggle to show or hide.
          </p>
        </div>
        <AddBlock />
      </header>

      {content.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="No blocks yet"
          description="Add your first block to start building your page."
          className="py-10"
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2.5">
              {content.map((block) => (
                <BlockItem key={block.id} block={block} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}
