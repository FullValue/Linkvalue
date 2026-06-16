"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResolvedStyles } from "@/lib/themes";
import type { GalleryImage, GalleryMeta } from "@/lib/gallery";

type Mode = "live" | "preview";

function Tile({
  image,
  blockId,
  index,
  mode,
  className,
}: {
  image: GalleryImage;
  blockId: string;
  index: number;
  mode: Mode;
  className?: string;
}) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element -- user uploads; served straight from Storage CDN
    <img
      src={image.url}
      alt={image.alt || ""}
      loading="lazy"
      decoding="async"
      className={cn("size-full object-cover", className)}
    />
  );

  if (mode === "live" && image.link) {
    return (
      <a
        href={`/api/go/${blockId}?i=${index}`}
        aria-label={image.alt || "Open image link"}
        className="block size-full transition-opacity hover:opacity-90"
      >
        {img}
      </a>
    );
  }
  return img;
}

export function ImageGalleryBlock({
  blockId,
  meta,
  mode,
  styles,
}: {
  blockId: string;
  meta: GalleryMeta;
  mode: Mode;
  styles: ResolvedStyles;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { images } = meta;

  if (images.length === 0) return null;

  if (meta.layout === "carousel") {
    const scrollTo = (i: number) => {
      const el = scroller.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(images.length - 1, i));
      el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
      setActive(clamped);
    };

    return (
      <div className="group relative w-full">
        <div
          ref={scroller}
          onScroll={(e) => {
            const el = e.currentTarget;
            setActive(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="flex w-full snap-x snap-mandatory overflow-x-auto rounded-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, i) => (
            <div
              key={`${image.url}-${i}`}
              className="relative aspect-[4/5] w-full shrink-0 snap-center bg-black/20"
            >
              <Tile image={image} blockId={blockId} index={i} mode={mode} />
            </div>
          ))}
        </div>

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => scrollTo(active - 1)}
              aria-label="Previous image"
              className="absolute top-1/2 left-2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-0"
              disabled={active === 0}
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollTo(active + 1)}
              aria-label="Next image"
              className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-0"
              disabled={active === images.length - 1}
            >
              <ChevronRight className="size-4" />
            </button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "size-1.5 rounded-full transition-all",
                    i === active ? "w-4 bg-white" : "bg-white/50",
                  )}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    );
  }

  // Grid
  return (
    <div
      className={cn(
        "grid w-full gap-2",
        images.length === 1 ? "grid-cols-1" : "grid-cols-2",
      )}
      style={{ color: styles.textColor }}
    >
      {images.map((image, i) => (
        <div
          key={`${image.url}-${i}`}
          className={cn(
            "relative overflow-hidden rounded-xl bg-black/20",
            images.length === 1 ? "aspect-video" : "aspect-square",
            // Make a lone trailing image in an odd set span both columns.
            images.length > 1 && images.length % 2 === 1 && i === images.length - 1
              ? "col-span-2 aspect-video"
              : "",
          )}
        >
          <Tile image={image} blockId={blockId} index={i} mode={mode} />
        </div>
      ))}
    </div>
  );
}
