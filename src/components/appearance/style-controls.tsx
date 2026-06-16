"use client";

import { useState, useRef } from "react";
import { useBuilder } from "@/components/builder/builder-context";
import {
  FONT_LABELS,
  HEADER_LAYOUTS,
  type FontKey,
  type ButtonStyle,
  type ButtonRadius,
  type ButtonShadow,
  type PatternPreset,
  type BackgroundStyle,
} from "@/lib/themes";
import { useMediaUpload } from "@/components/builder/use-media-upload";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ColorField } from "./color-field";

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="bg-secondary/50 inline-flex flex-wrap rounded-lg p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition",
            value === o.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm">{label}</span>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
      {children}
    </p>
  );
}

function ImageUploadButton({
  label,
  url,
  uploading,
  onUpload,
  onClear,
  fileRef,
}: {
  label: string;
  url: string | null;
  uploading: boolean;
  onUpload: (file: File) => void;
  onClear: () => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
      {url ? (
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="h-8 w-14 rounded object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground text-base leading-none"
            aria-label={`Remove ${label}`}
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="border-border text-muted-foreground hover:text-foreground flex h-8 items-center gap-1.5 rounded border px-2.5 text-xs"
        >
          {uploading ? "Uploading…" : `Upload ${label}`}
        </button>
      )}
    </div>
  );
}

function bgBaseColor(bg: BackgroundStyle): string {
  if (bg.type === "solid") return bg.color;
  if (bg.type === "gradient" || bg.type === "blur") return bg.from;
  if (bg.type === "pattern") return bg.bg;
  return "#0a0a0b";
}

const BG_TYPES: { value: BackgroundStyle["type"]; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "gradient", label: "Gradient" },
  { value: "image", label: "Image" },
  { value: "pattern", label: "Pattern" },
  { value: "blur", label: "Blur" },
];

const PATTERN_PRESETS: { value: PatternPreset; label: string }[] = [
  { value: "dots", label: "Dots" },
  { value: "grid", label: "Grid" },
  { value: "stripes", label: "Stripes" },
];

const BUTTON_STYLES: { value: ButtonStyle; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "glass", label: "Glass" },
  { value: "outline", label: "Outline" },
];

const BUTTON_RADII: { value: ButtonRadius; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "round", label: "Rounded" },
  { value: "rounder", label: "Rounder" },
  { value: "full", label: "Pill" },
];

const BUTTON_SHADOWS: { value: ButtonShadow; label: string }[] = [
  { value: "none", label: "None" },
  { value: "soft", label: "Soft" },
  { value: "strong", label: "Strong" },
  { value: "hard", label: "Hard" },
];

export function StyleControls() {
  const { styles, updateStyles, profile, setHeaderLayout, setBanner, userId } = useBuilder();
  const bg = styles.background;
  const { upload, uploading } = useMediaUpload(userId);
  // pendingBgType: tracks "image" selection before an image is actually uploaded
  const [pendingBgType, setPendingBgType] = useState<BackgroundStyle["type"] | null>(null);
  const activeBgType = pendingBgType ?? bg.type;
  const wallpaperRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const headerLayout = profile.header_layout ?? "classic";
  const bannerUrl = profile.banner_url ?? null;

  function switchBgType(type: BackgroundStyle["type"]) {
    if (type === activeBgType) return;
    const base = bgBaseColor(bg);
    if (type === "solid") {
      setPendingBgType(null);
      updateStyles({ background: { type: "solid", color: base } });
    } else if (type === "gradient") {
      setPendingBgType(null);
      updateStyles({
        background: {
          type: "gradient",
          from: base,
          to: bg.type === "gradient" ? bg.to : "#7c5cff",
          angle: bg.type === "gradient" ? bg.angle : 160,
        },
      });
    } else if (type === "blur") {
      setPendingBgType(null);
      updateStyles({
        background: {
          type: "blur",
          from: base,
          to: bg.type === "blur" ? bg.to : "#7c5cff",
          base: bg.type === "blur" ? bg.base : base,
        },
      });
    } else if (type === "pattern") {
      setPendingBgType(null);
      updateStyles({
        background: {
          type: "pattern",
          preset: bg.type === "pattern" ? bg.preset : "dots",
          color: bg.type === "pattern" ? bg.color : "#ffffff",
          bg: base,
        },
      });
    } else {
      // image — don't persist until an image is uploaded
      setPendingBgType("image");
    }
  }

  async function handleWallpaperUpload(file: File) {
    const url = await upload(file);
    if (url) {
      const dim = bg.type === "image" ? bg.dim : 0.3;
      setPendingBgType(null);
      updateStyles({ background: { type: "image", url, dim } });
    }
  }

  async function handleBannerUpload(file: File) {
    const url = await upload(file);
    if (url) await setBanner(url);
  }

  return (
    <div className="flex flex-col divide-y">
      {/* Header */}
      <div className="flex flex-col gap-1 pb-4">
        <SectionLabel>Header</SectionLabel>
        <Row label="Layout">
          <Segmented<string>
            value={headerLayout}
            options={HEADER_LAYOUTS.map((l) => ({ value: l.id, label: l.name }))}
            onChange={setHeaderLayout}
          />
        </Row>
        {headerLayout === "banner" && (
          <Row label="Image">
            <ImageUploadButton
              label="banner"
              url={bannerUrl}
              uploading={uploading}
              onUpload={handleBannerUpload}
              onClear={() => setBanner(null)}
              fileRef={bannerRef}
            />
          </Row>
        )}
      </div>

      {/* Background */}
      <div className="flex flex-col gap-1 py-4">
        <SectionLabel>Background</SectionLabel>
        <Row label="Type">
          <Segmented<BackgroundStyle["type"]>
            value={activeBgType}
            options={BG_TYPES}
            onChange={switchBgType}
          />
        </Row>

        {activeBgType === "solid" && bg.type === "solid" && (
          <ColorField
            label="Colour"
            value={bg.color}
            onChange={(color) => updateStyles({ background: { type: "solid", color } })}
          />
        )}

        {activeBgType === "gradient" && bg.type === "gradient" && (
          <>
            <ColorField
              label="From"
              value={bg.from}
              onChange={(from) =>
                updateStyles({
                  background: { type: "gradient", from, to: bg.to, angle: bg.angle },
                })
              }
            />
            <ColorField
              label="To"
              value={bg.to}
              onChange={(to) =>
                updateStyles({
                  background: { type: "gradient", from: bg.from, to, angle: bg.angle },
                })
              }
            />
            <Row label={`Angle · ${bg.angle}°`}>
              <input
                type="range"
                min={0}
                max={360}
                value={bg.angle}
                onChange={(e) =>
                  updateStyles({
                    background: {
                      type: "gradient",
                      from: bg.from,
                      to: bg.to,
                      angle: Number(e.target.value),
                    },
                  })
                }
                className="accent-brand w-40"
                aria-label="Gradient angle"
              />
            </Row>
          </>
        )}

        {activeBgType === "image" && (
          <>
            <Row label="Image">
              <ImageUploadButton
                label="wallpaper"
                url={bg.type === "image" ? bg.url : null}
                uploading={uploading}
                onUpload={handleWallpaperUpload}
                onClear={() => {
                  setPendingBgType(null);
                  updateStyles({ background: { type: "solid", color: "#0a0a0b" } });
                }}
                fileRef={wallpaperRef}
              />
            </Row>
            {bg.type === "image" && (
              <Row label={`Dim · ${Math.round(bg.dim * 100)}%`}>
                <input
                  type="range"
                  min={0}
                  max={85}
                  value={Math.round(bg.dim * 100)}
                  onChange={(e) =>
                    updateStyles({
                      background: {
                        type: "image",
                        url: bg.url,
                        dim: Number(e.target.value) / 100,
                      },
                    })
                  }
                  className="accent-brand w-40"
                  aria-label="Dim intensity"
                />
              </Row>
            )}
          </>
        )}

        {activeBgType === "pattern" && bg.type === "pattern" && (
          <>
            <Row label="Pattern">
              <Segmented<PatternPreset>
                value={bg.preset}
                options={PATTERN_PRESETS}
                onChange={(preset) =>
                  updateStyles({
                    background: { type: "pattern", preset, color: bg.color, bg: bg.bg },
                  })
                }
              />
            </Row>
            <ColorField
              label="Ink"
              value={bg.color}
              onChange={(color) =>
                updateStyles({
                  background: { type: "pattern", preset: bg.preset, color, bg: bg.bg },
                })
              }
            />
            <ColorField
              label="Base"
              value={bg.bg}
              onChange={(bgColor) =>
                updateStyles({
                  background: { type: "pattern", preset: bg.preset, color: bg.color, bg: bgColor },
                })
              }
            />
          </>
        )}

        {activeBgType === "blur" && bg.type === "blur" && (
          <>
            <ColorField
              label="From"
              value={bg.from}
              onChange={(from) =>
                updateStyles({ background: { type: "blur", from, to: bg.to, base: bg.base } })
              }
            />
            <ColorField
              label="To"
              value={bg.to}
              onChange={(to) =>
                updateStyles({ background: { type: "blur", from: bg.from, to, base: bg.base } })
              }
            />
            <ColorField
              label="Base"
              value={bg.base}
              onChange={(base) =>
                updateStyles({ background: { type: "blur", from: bg.from, to: bg.to, base } })
              }
            />
          </>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-1 py-4">
        <SectionLabel>Buttons</SectionLabel>
        <ColorField
          label="Fill"
          value={styles.buttonColor}
          onChange={(buttonColor) => updateStyles({ buttonColor })}
        />
        <ColorField
          label="Text"
          value={styles.buttonTextColor}
          onChange={(buttonTextColor) => updateStyles({ buttonTextColor })}
        />
        <Row label="Style">
          <Segmented<ButtonStyle>
            value={styles.buttonStyle}
            options={BUTTON_STYLES}
            onChange={(buttonStyle) => updateStyles({ buttonStyle })}
          />
        </Row>
        <Row label="Radius">
          <Segmented<ButtonRadius>
            value={styles.buttonRadius}
            options={BUTTON_RADII}
            onChange={(buttonRadius) => updateStyles({ buttonRadius })}
          />
        </Row>
        <Row label="Shadow">
          <Segmented<ButtonShadow>
            value={styles.buttonShadow}
            options={BUTTON_SHADOWS}
            onChange={(buttonShadow) => updateStyles({ buttonShadow })}
          />
        </Row>
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1 py-4">
        <SectionLabel>Text</SectionLabel>
        <ColorField
          label="Primary"
          value={styles.textColor}
          onChange={(textColor) => updateStyles({ textColor })}
        />
        <ColorField
          label="Muted"
          value={styles.mutedTextColor}
          onChange={(mutedTextColor) => updateStyles({ mutedTextColor })}
        />
      </div>

      {/* Font */}
      <div className="flex flex-col gap-1 pt-4">
        <Row label="Font">
          <Select
            value={styles.font}
            onValueChange={(v) => updateStyles({ font: v as FontKey })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(FONT_LABELS) as FontKey[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {FONT_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
      </div>
    </div>
  );
}
