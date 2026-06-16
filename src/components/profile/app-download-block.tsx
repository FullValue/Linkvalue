"use client";

import { useSyncExternalStore } from "react";
import type { ResolvedStyles } from "@/lib/themes";
import {
  badgesToShow,
  detectDevice,
  type AppDownloadMeta,
  type Device,
  type StoreKey,
} from "@/lib/app-download";

type Mode = "live" | "preview";

// Read the real client device after hydration without a setState-in-effect.
// SSR / first paint uses the server-detected device, so markup matches.
const noopSubscribe = () => () => {};
function useViewerDevice(serverDevice: Device): Device {
  return useSyncExternalStore(
    noopSubscribe,
    () => detectDevice(navigator.userAgent),
    () => serverDevice,
  );
}

const BADGE: Record<
  StoreKey,
  (variant: "black" | "white") => { src: string; alt: string }
> = {
  ios: (variant) => ({
    src: variant === "white" ? "/badges/app-store-white.svg" : "/badges/app-store.svg",
    alt: "Download on the App Store",
  }),
  // Google Play ships a single official badge — variant doesn't apply.
  android: () => ({ src: "/badges/google-play.svg", alt: "Get it on Google Play" }),
};

export function AppDownloadBlock({
  blockId,
  meta,
  device: serverDevice,
  mode,
  styles,
}: {
  blockId: string;
  meta: AppDownloadMeta;
  device: Device;
  mode: Mode;
  styles: ResolvedStyles;
}) {
  const device = useViewerDevice(serverDevice);
  const stores = badgesToShow(meta, mode === "preview" ? "desktop" : device);
  if (stores.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-2.5">
      {meta.heading ? (
        <p className="text-sm font-medium" style={{ color: styles.textColor }}>
          {meta.heading}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {stores.map((s) => {
          const badge = BADGE[s](meta.badge_variant);
          const img = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={badge.src}
              alt={badge.alt}
              className="h-11 w-auto"
              loading="lazy"
              decoding="async"
            />
          );
          if (mode === "preview") {
            return (
              <span key={s} className="opacity-90">
                {img}
              </span>
            );
          }
          return (
            <a
              key={s}
              href={`/api/go/${blockId}?store=${s}`}
              aria-label={badge.alt}
              className="rounded-lg transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {img}
            </a>
          );
        })}
      </div>
    </div>
  );
}
