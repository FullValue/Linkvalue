"use client";

import type { LucideIcon } from "lucide-react";
import {
  Heading,
  Images,
  Link2,
  MailPlus,
  Play,
  Smartphone,
  Type,
  Video,
} from "lucide-react";
import type { Block, BlockType } from "@/lib/supabase/types";
import { readGalleryMeta } from "@/lib/gallery";
import { readEmailSignupMeta, readTextMeta } from "@/lib/block-content";
import { BlockDialog } from "./block-dialog";
import { AppDownloadDialog } from "./app-download-dialog";
import { GalleryDialog } from "./gallery-dialog";
import { TextDialog } from "./text-dialog";
import { HeaderDialog } from "./header-dialog";
import { EmailSignupDialog } from "./email-signup-dialog";

/**
 * Single registry for the builder's content block types: what the "Add" menu
 * offers, the icon/title/subtitle shown in the block list, and which editor
 * dialog opens. Social blocks are managed separately (SocialEditor), so they're
 * intentionally absent here. Add a new content block by extending this file plus
 * the validation schema, the server action branch and the public renderer.
 */

/** Content block types that appear in the draggable list and the Add menu. */
export const CONTENT_BLOCK_TYPES = [
  "link",
  "embed",
  "gallery",
  "app_download",
  "text",
  "header",
  "email_signup",
] as const satisfies readonly BlockType[];

export type ContentBlockType = (typeof CONTENT_BLOCK_TYPES)[number];

export function isContentBlock(type: BlockType): type is ContentBlockType {
  return (CONTENT_BLOCK_TYPES as readonly BlockType[]).includes(type);
}

interface AddOption {
  type: ContentBlockType;
  label: string;
  description: string;
  icon: LucideIcon;
}

/** Ordered entries for the "Add block" dropdown. */
export const ADD_BLOCK_OPTIONS: AddOption[] = [
  { type: "link", label: "Link", description: "A titled button to any URL", icon: Link2 },
  {
    type: "embed",
    label: "Embed",
    description: "YouTube, Spotify or TikTok",
    icon: Video,
  },
  {
    type: "gallery",
    label: "Gallery",
    description: "A grid or carousel of images",
    icon: Images,
  },
  {
    type: "app_download",
    label: "App download",
    description: "App Store / Google Play",
    icon: Smartphone,
  },
  { type: "text", label: "Text", description: "A heading and paragraph", icon: Type },
  {
    type: "header",
    label: "Section header",
    description: "Group blocks under a title",
    icon: Heading,
  },
  {
    type: "email_signup",
    label: "Signup form",
    description: "Collect emails or phone numbers",
    icon: MailPlus,
  },
];

const LIST_ICON: Partial<Record<BlockType, LucideIcon>> = {
  link: Link2,
  embed: Play,
  gallery: Images,
  app_download: Smartphone,
  text: Type,
  header: Heading,
  email_signup: MailPlus,
};

export function BlockIcon({ type, className }: { type: BlockType; className?: string }) {
  const Icon = LIST_ICON[type] ?? Link2;
  return <Icon className={className} />;
}

const DEFAULT_TITLE: Partial<Record<BlockType, string>> = {
  link: "Link",
  embed: "Embed",
  gallery: "Gallery",
  app_download: "App download",
  text: "Text",
  header: "Section header",
  email_signup: "Signup form",
};

export function blockTitle(block: Block): string {
  return block.title?.trim() || DEFAULT_TITLE[block.type] || "Block";
}

export function blockSubtitle(block: Block): string {
  switch (block.type) {
    case "app_download":
      return "App Store / Google Play";
    case "gallery": {
      const { images, layout } = readGalleryMeta(block.meta);
      return `${images.length} image${images.length === 1 ? "" : "s"} · ${layout}`;
    }
    case "text":
      return readTextMeta(block.meta).body ?? "";
    case "header":
      return "Section header";
    case "email_signup":
      return readEmailSignupMeta(block.meta).fields === "email_phone"
        ? "Email + phone"
        : "Email";
    default:
      return block.url ?? "";
  }
}

/** Renders the correct editor dialog for a content block type. */
export function BlockEditor({
  type,
  block,
  onClose,
}: {
  type: ContentBlockType;
  block?: Block;
  onClose: () => void;
}) {
  if (type === "app_download") return <AppDownloadDialog block={block} onClose={onClose} />;
  if (type === "gallery") return <GalleryDialog block={block} onClose={onClose} />;
  if (type === "text") return <TextDialog block={block} onClose={onClose} />;
  if (type === "header") return <HeaderDialog block={block} onClose={onClose} />;
  if (type === "email_signup")
    return <EmailSignupDialog block={block} onClose={onClose} />;
  return <BlockDialog kind={type} block={block} onClose={onClose} />;
}
