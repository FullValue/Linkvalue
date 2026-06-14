import { z } from "zod";

/**
 * Public (browser-safe) environment. Validated lazily so that pages which
 * don't touch Supabase can still build/prerender without secrets present.
 *
 * `process.env.NEXT_PUBLIC_*` must be referenced by full literal name for
 * Next.js to inline the values into the client bundle.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
});

type ClientEnv = z.infer<typeof clientEnvSchema>;
let cached: ClientEnv | null = null;

export function clientEnv(): ClientEnv {
  if (cached) return cached;
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!parsed.success) {
    throw new Error(
      "Invalid Supabase environment. Copy .env.example to .env.local and fill it in:\n" +
        parsed.error.issues
          .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
          .join("\n"),
    );
  }
  cached = parsed.data;
  return cached;
}
