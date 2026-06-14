"use client";

import { useEffect, useRef } from "react";

/** Fires a single page-view beacon on mount. Renders nothing. */
export function PageViewTracker({ username }: { username: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    fetch("/api/track/view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username }),
      keepalive: true,
    }).catch(() => {});
  }, [username]);

  return null;
}
