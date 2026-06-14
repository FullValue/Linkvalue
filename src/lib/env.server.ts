import "server-only";
import { z } from "zod";

/**
 * Server-only secrets. The `server-only` import makes the build fail loudly
 * if this module is ever pulled into a client bundle.
 */
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY is required (server-only)"),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;
let cached: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
  if (!parsed.success) {
    throw new Error(
      "Invalid server environment:\n" +
        parsed.error.issues
          .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
          .join("\n"),
    );
  }
  cached = parsed.data;
  return cached;
}
