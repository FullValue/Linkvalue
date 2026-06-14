"use client";

import { useId, useState } from "react";

const FULL_HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const id = useId();
  const [text, setText] = useState(value);

  function commit(next: string) {
    setText(next);
    if (FULL_HEX.test(next)) onChange(next);
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) commit(v);
          }}
          spellCheck={false}
          className="border-input bg-background focus-visible:ring-ring w-24 rounded-md border px-2 py-1 font-mono text-xs uppercase outline-none focus-visible:ring-2"
          aria-label={`${label} hex`}
        />
        <label
          className="border-input relative size-8 cursor-pointer overflow-hidden rounded-md border"
          style={{ background: FULL_HEX.test(text) ? text : "#000" }}
        >
          <input
            id={id}
            type="color"
            value={FULL_HEX.test(text) ? text : "#000000"}
            onChange={(e) => commit(e.target.value)}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </label>
      </div>
    </div>
  );
}
