import { z } from "zod";

export const profileSchema = z.object({
  display_name: z.string().trim().max(60, "At most 60 characters").optional(),
  bio: z.string().trim().max(200, "At most 200 characters").optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
