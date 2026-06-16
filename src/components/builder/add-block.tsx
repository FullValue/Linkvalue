"use client";

import { useState } from "react";
import { Plus, Link2, Video, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { BlockDialog } from "./block-dialog";
import { AppDownloadDialog } from "./app-download-dialog";

type Kind = "link" | "embed" | "app_download";

export function AddBlock() {
  const [kind, setKind] = useState<Kind | null>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" />
            Add block
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onSelect={() => setKind("link")}>
            <Link2 className="size-4" />
            Link
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setKind("embed")}>
            <Video className="size-4" />
            Embed — YouTube / Spotify
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setKind("app_download")}>
            <Smartphone className="size-4" />
            App download
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {(kind === "link" || kind === "embed") && (
        <BlockDialog kind={kind} onClose={() => setKind(null)} />
      )}
      {kind === "app_download" && (
        <AppDownloadDialog onClose={() => setKind(null)} />
      )}
    </>
  );
}
