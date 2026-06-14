"use client";

import { useActionState } from "react";
import {
  updateEmailAction,
  type SettingsState,
} from "@/app/(dashboard)/dashboard/settings/actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SubmitButton,
  FormError,
  FormSuccess,
  FieldError,
} from "@/components/auth/form-bits";

export function UpdateEmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, formAction] = useActionState<SettingsState, FormData>(
    updateEmailAction,
    {},
  );

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Email</CardTitle>
          <CardDescription>
            Used to sign in and for account notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <FormError message={state.error} />
          <FormSuccess message={state.success} />
          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={currentEmail}
              autoComplete="email"
              required
            />
            <FieldError messages={state.fieldErrors?.email} />
          </div>
        </CardContent>
        <CardFooter className="border-border/60 mt-2 border-t pt-4">
          <SubmitButton className="sm:w-auto">Save email</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
