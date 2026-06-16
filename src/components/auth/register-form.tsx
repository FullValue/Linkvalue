"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { signUpAction, checkUsernameAction, type AuthState } from "@/app/(auth)/actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeUsername } from "@/lib/usernames";
import { profileHostHint } from "@/lib/site";
import { cn } from "@/lib/utils";
import { SubmitButton, FormError, FieldError } from "./form-bits";

type Availability =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "ok"; message: string }
  | { state: "bad"; message: string };

const hostHint = profileHostHint();

export function RegisterForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(signUpAction, {});
  const [username, setUsername] = useState("");
  const [result, setResult] = useState<{
    username: string;
    available: boolean;
    message: string;
  } | null>(null);

  // Only the async result is stored in state; the visible status is derived,
  // so the effect never calls setState synchronously.
  useEffect(() => {
    if (username.length < 3) return;
    const t = setTimeout(async () => {
      const res = await checkUsernameAction(username);
      setResult({ username, available: res.available, message: res.message });
    }, 400);
    return () => clearTimeout(t);
  }, [username]);

  const avail: Availability =
    username.length === 0
      ? { state: "idle" }
      : username.length < 3
        ? { state: "bad", message: "At least 3 characters" }
        : result && result.username === username
          ? {
              state: result.available ? "ok" : "bad",
              message: result.message,
            }
          : { state: "checking" };

  return (
    <Card className="border-luminous">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Create your page</CardTitle>
        <CardDescription>Claim your handle — it takes a minute.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <FormError message={state.error} />

          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <div className="border-input focus-within:ring-ring flex items-stretch overflow-hidden rounded-md border focus-within:ring-2">
              {hostHint.before && (
                <span className="text-muted-foreground bg-muted/50 flex items-center border-r px-3 text-sm select-none">
                  {hostHint.before}
                </span>
              )}
              <input
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(normalizeUsername(e.target.value))}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="yourname"
                className="placeholder:text-muted-foreground flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                aria-describedby="username-status"
              />
              {hostHint.after && (
                <span className="text-muted-foreground bg-muted/50 flex items-center border-l px-3 text-sm select-none">
                  {hostHint.after}
                </span>
              )}
              <span className="flex items-center pr-3" id="username-status">
                {avail.state === "checking" && (
                  <Loader2 className="text-muted-foreground size-4 animate-spin" />
                )}
                {avail.state === "ok" && <Check className="size-4 text-emerald-400" />}
                {avail.state === "bad" && <X className="text-destructive size-4" />}
              </span>
            </div>
            <p
              className={cn(
                "text-xs",
                avail.state === "ok" && "text-emerald-400",
                avail.state === "bad" && "text-destructive",
                (avail.state === "idle" || avail.state === "checking") &&
                  "text-muted-foreground",
              )}
            >
              {avail.state === "ok" || avail.state === "bad"
                ? avail.message
                : "Lowercase letters, numbers and hyphens."}
            </p>
            <FieldError messages={state.fieldErrors?.username} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
            <FieldError messages={state.fieldErrors?.email} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              required
            />
            <FieldError messages={state.fieldErrors?.password} />
          </div>

          <SubmitButton className="mt-2" disabled={avail.state === "bad"}>
            Create account
          </SubmitButton>
        </form>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
