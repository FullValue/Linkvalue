"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ADD_BLOCK_OPTIONS,
  BlockEditor,
  type ContentBlockType,
} from "./block-types";

export function AddBlock() {
  const [kind, setKind] = useState<ContentBlockType | null>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" />
            Add block
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {ADD_BLOCK_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.type}
              onSelect={() => setKind(opt.type)}
              className="gap-2.5"
            >
              <opt.icon className="size-4 shrink-0" />
              <span className="flex flex-col">
                <span className="text-sm font-medium">{opt.label}</span>
                <span className="text-muted-foreground text-xs">{opt.description}</span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {kind && <BlockEditor type={kind} onClose={() => setKind(null)} />}
    </>
  );
}
