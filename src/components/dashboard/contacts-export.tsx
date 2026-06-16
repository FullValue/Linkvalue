"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Contact } from "@/lib/supabase/types";

function csvCell(value: string | null): string {
  const s = value ?? "";
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function ContactsExport({ contacts }: { contacts: Contact[] }) {
  function download() {
    const header = ["Email", "Phone", "Collected at"];
    const rows = contacts.map((c) =>
      [csvCell(c.email), csvCell(c.phone), csvCell(c.created_at)].join(","),
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={download}
      disabled={contacts.length === 0}
      className="gap-1.5"
    >
      <Download className="size-4" />
      Export CSV
    </Button>
  );
}
