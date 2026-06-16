/**
 * Shared types/helpers for the content & collection blocks:
 * `text` (heading in block.title + body in meta), `header` (title only), and
 * `email_signup` (a contact-collection form configured via meta).
 */

export interface TextMeta {
  body: string | null;
}

export function readTextMeta(meta: unknown): TextMeta {
  const m = (meta ?? {}) as Record<string, unknown>;
  return { body: typeof m.body === "string" && m.body ? m.body : null };
}

export type SignupFields = "email" | "email_phone";

export interface EmailSignupMeta {
  heading: string | null;
  description: string | null;
  fields: SignupFields;
  button_label: string | null;
  success_message: string | null;
}

export function readEmailSignupMeta(meta: unknown): EmailSignupMeta {
  const m = (meta ?? {}) as Record<string, unknown>;
  return {
    heading: typeof m.heading === "string" && m.heading ? m.heading : null,
    description: typeof m.description === "string" && m.description ? m.description : null,
    fields: m.fields === "email_phone" ? "email_phone" : "email",
    button_label:
      typeof m.button_label === "string" && m.button_label ? m.button_label : null,
    success_message:
      typeof m.success_message === "string" && m.success_message
        ? m.success_message
        : null,
  };
}
