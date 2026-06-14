"use client";

import { useBuilder } from "@/components/builder/builder-context";
import { FONT_LABELS, type FontKey, type ButtonShape } from "@/lib/themes";
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

export function StyleControls() {
  const { styles, updateStyles } = useBuilder();
  const bg = styles.background;

  function setBgType(type: "solid" | "gradient") {
    if (type === bg.type) return;
    if (type === "solid") {
      updateStyles({
        background: {
          type: "solid",
          color: bg.type === "gradient" ? bg.from : bg.color,
        },
      });
    } else {
      updateStyles({
        background: {
          type: "gradient",
          from: bg.type === "solid" ? bg.color : bg.from,
          to: bg.type === "gradient" ? bg.to : "#7c5cff",
          angle: bg.type === "gradient" ? bg.angle : 160,
        },
      });
    }
  }

  return (
    <div className="flex flex-col divide-y">
      {/* Background */}
      <div className="flex flex-col gap-1 pb-4">
        <Row label="Background">
          <Segmented
            value={bg.type}
            options={[
              { value: "solid", label: "Solid" },
              { value: "gradient", label: "Gradient" },
            ]}
            onChange={(v) => setBgType(v as "solid" | "gradient")}
          />
        </Row>
        {bg.type === "solid" ? (
          <ColorField
            label="Colour"
            value={bg.color}
            onChange={(color) => updateStyles({ background: { type: "solid", color } })}
          />
        ) : (
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
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-1 py-4">
        <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
          Buttons
        </p>
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
        <Row label="Shape">
          <Segmented<ButtonShape>
            value={styles.buttonShape}
            options={[
              { value: "rounded", label: "Rounded" },
              { value: "pill", label: "Pill" },
              { value: "square", label: "Square" },
              { value: "outline", label: "Outline" },
            ]}
            onChange={(buttonShape) => updateStyles({ buttonShape })}
          />
        </Row>
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1 py-4">
        <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
          Text
        </p>
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
