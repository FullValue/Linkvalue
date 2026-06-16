"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import type { ResolvedStyles } from "@/lib/themes";
import type { EmailSignupMeta } from "@/lib/block-content";

type Mode = "live" | "preview";

export function EmailSignupBlock({
  blockId,
  username,
  meta,
  mode,
  styles,
}: {
  blockId: string;
  username: string;
  meta: EmailSignupMeta;
  mode: Mode;
  styles: ResolvedStyles;
}) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [hp, setHp] = useState(""); // honeypot — real users never fill this
  const [status, setStatus] = useState<"idle" | "pending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const preview = mode === "preview";
  const wantsPhone = meta.fields === "email_phone";

  const fieldStyle: React.CSSProperties = {
    background: "rgba(127,127,127,0.12)",
    color: styles.textColor,
    border: `1px solid ${styles.mutedTextColor}66`,
    borderRadius: 12,
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (preview) return;
    setError(null);
    setStatus("pending");
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, blockId, email, phone, website: hp }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error || "Something went wrong — please try again");
        setStatus("idle");
        return;
      }
      setStatus("done");
    } catch {
      setError("Something went wrong — please try again");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div
        className="flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-center text-sm font-medium"
        style={{ background: "rgba(127,127,127,0.12)", color: styles.textColor }}
      >
        <Check className="size-4 shrink-0" />
        {meta.success_message || "Thanks — you're on the list!"}
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-col gap-2.5 rounded-2xl p-4"
      style={{ background: "rgba(127,127,127,0.10)" }}
    >
      {meta.heading ? (
        <p className="text-center text-[15px] font-semibold" style={{ color: styles.textColor }}>
          {meta.heading}
        </p>
      ) : null}
      {meta.description ? (
        <p className="text-center text-sm" style={{ color: styles.mutedTextColor }}>
          {meta.description}
        </p>
      ) : null}

      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        disabled={preview}
        className="w-full px-4 py-2.5 text-sm outline-none placeholder:opacity-60"
        style={fieldStyle}
      />
      {wantsPhone ? (
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (optional)"
          autoComplete="tel"
          disabled={preview}
          className="w-full px-4 py-2.5 text-sm outline-none placeholder:opacity-60"
          style={fieldStyle}
        />
      ) : null}

      {/* Honeypot: hidden from humans, tempting to bots. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        className="hidden"
      />

      {error ? (
        <p className="text-center text-xs" style={{ color: "#ef4444" }}>
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={preview || status === "pending"}
        className="flex w-full items-center justify-center gap-2 px-5 py-3 text-[15px] font-medium transition-transform hover:scale-[1.01] disabled:opacity-70"
        style={{
          background: styles.buttonColor,
          color: styles.buttonTextColor,
          borderRadius: 12,
        }}
      >
        {status === "pending" ? <Loader2 className="size-4 animate-spin" /> : null}
        {meta.button_label || "Subscribe"}
      </button>
    </form>
  );
}
