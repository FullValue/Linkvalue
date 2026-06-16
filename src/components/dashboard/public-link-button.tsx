"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { profileDisplayUrl, profileUrl } from "@/lib/site";

export function PublicLinkButton({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  const url = profileUrl(username);
  const display = profileDisplayUrl(username);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Public link copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy — copy it from the address bar");
    }
  }

  return (
    <div className="hidden items-center sm:flex">
      <Button
        variant="outline"
        size="sm"
        onClick={copy}
        className="gap-1.5 rounded-r-none font-normal"
        title="Copy public link"
      >
        {copied ? (
          <Check className="size-3.5 text-emerald-400" />
        ) : (
          <Copy className="text-muted-foreground size-3.5" />
        )}
        <span className="max-w-[150px] truncate">{display}</span>
      </Button>
      <Button
        asChild
        variant="outline"
        size="sm"
        className="rounded-l-none border-l-0 px-2"
        title="Open public page"
      >
        <a href={url} target="_blank" rel="noreferrer">
          <ExternalLink className="size-3.5" />
        </a>
      </Button>
    </div>
  );
}
