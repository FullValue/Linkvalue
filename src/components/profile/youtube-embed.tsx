"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Lite YouTube embed: shows the video thumbnail with a play button, and only
 * loads the (heavy) iframe player when the visitor clicks. Used on both the
 * live preview and the public page.
 */
export function YouTubeEmbed({
  id,
  title,
  embedUrl,
}: {
  id: string;
  title?: string | null;
  embedUrl: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-black/30"
      style={{ aspectRatio: "16 / 9" }}
    >
      {playing ? (
        <iframe
          src={`${embedUrl}?autoplay=1&rel=0`}
          title={title || "YouTube video"}
          allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={title ? `Play ${title}` : "Play video"}
          className="group absolute inset-0 block size-full cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- YouTube CDN thumbnail, no optimizer round-trip */}
          <img
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt={title || "Video thumbnail"}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
          <span className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/25" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-14 place-items-center rounded-full bg-black/55 shadow-lg backdrop-blur-sm transition-transform duration-200 group-hover:scale-105">
              <Play className="size-6 translate-x-px fill-white text-white" />
            </span>
          </span>
          {title ? (
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pt-8 pb-2 text-left text-sm font-medium text-white">
              <span className="line-clamp-1">{title}</span>
            </span>
          ) : null}
        </button>
      )}
    </div>
  );
}
