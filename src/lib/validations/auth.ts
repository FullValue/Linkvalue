import { z } from "zod";
import {
  USERNAME_REGEX,
  USERNAME_MIN,
  USERNAME_MAX,
  isReservedUsername,
} from "@/lib/usernames";

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(USERNAME_MIN, `At least ${USERNAME_MIN} characters`)
  .max(USERNAME_MAX, `At most ${USERNAME_MAX} characters`)
  .regex(USERNAME_REGEX, "Use lowercase letters, numbers and hyphens only")
  .refine((v) => !isReservedUsername(v), "This username is reserved");

export const emailSchema = z.email("Enter a valid email address");

// 72-byte cap matches bcrypt / Supabase Auth's password length limit.
export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .max(72, "At most 72 characters");

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;

export const updateEmailSchema = z.object({ email: emailSchema });

export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
