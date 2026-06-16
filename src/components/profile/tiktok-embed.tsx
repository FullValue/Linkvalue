"use client";

import { useState } from "react";
import { SiTiktok } from "@icons-pack/react-simple-icons";
import { Play } from "lucide-react";

/**
 * Lite TikTok embed: a lightweight branded facade that loads the (heavy) TikTok
 * player iframe only when the visitor clicks. TikTok doesn't expose a thumbnail
 * without a server-side oEmbed round-trip, so we paint a branded poster instead.
 * Vertical 9:16, capped to a sensible width so it doesn't dominate the page.
 */
export function TikTokEmbed({
  title,
  embedUrl,
}: {
  title?: string | null;
  embedUrl: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[300px]">
      <div
        className="relative w-full overflow-hidden rounded-2xl bg-black"
        style={{ aspectRatio: "9 / 16" }}
      >
        {playing ? (
          <iframe
            src={embedUrl}
            title={title || "TikTok video"}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={title ? `Play ${title}` : "Play TikTok video"}
            className="group absolute inset-0 block size-full cursor-pointer"
          >
            <span
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 120% at 30% 20%, #25F4EE22, transparent 60%), radial-gradient(120% 120% at 70% 80%, #FE2C5522, transparent 60%), #050505",
              }}
            />
            <SiTiktok className="absolute top-4 left-4 size-6 text-white/90" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid size-14 place-items-center rounded-full bg-white/15 shadow-lg backdrop-blur-sm transition-transform duration-200 group-hover:scale-105">
                <Play className="size-6 translate-x-px fill-white text-white" />
              </span>
            </span>
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pt-8 pb-3 text-left text-sm font-medium text-white">
              <span className="line-clamp-1">{title || "Watch on TikTok"}</span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
