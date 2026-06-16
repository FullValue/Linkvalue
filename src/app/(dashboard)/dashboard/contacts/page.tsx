import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/analytics/stat-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ContactsExport } from "@/components/dashboard/contacts-export";

export const metadata: Metadata = { title: "Contacts" };

const dateFmt = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function ContactsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase
    .from("contacts")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  const contacts = data ?? [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            People who signed up through your page. Export anytime.
          </p>
        </div>
        <ContactsExport contacts={contacts} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Total contacts" value={contacts.length} />
      </div>

      <section className="bg-card mt-8 rounded-2xl border p-5">
        <h2 className="font-heading mb-4 text-sm font-semibold tracking-tight">
          All contacts
        </h2>
        {contacts.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No contacts yet"
            description="Add a signup form block to your page and collected emails will appear here."
            className="py-12"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-left text-xs">
                  <th className="px-2 py-2 font-medium">Email</th>
                  <th className="px-2 py-2 font-medium">Phone</th>
                  <th className="px-2 py-2 text-right font-medium">Collected</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="px-2 py-2.5">{c.email ?? "—"}</td>
                    <td className="px-2 py-2.5">{c.phone ?? "—"}</td>
                    <td className="text-muted-foreground px-2 py-2.5 text-right whitespace-nowrap">
                      {dateFmt.format(new Date(c.created_at))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
