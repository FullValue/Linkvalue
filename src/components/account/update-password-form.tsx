"use client";

import { useActionState } from "react";
import {
  updatePasswordAction,
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

export function UpdatePasswordForm() {
  const [state, formAction] = useActionState<SettingsState, FormData>(
    updatePasswordAction,
    {},
  );

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>At least 8 characters.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <FormError message={state.error} />
          <FormSuccess message={state.success} />
          <div className="grid gap-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
            <FieldError messages={state.fieldErrors?.password} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
            />
            <FieldError messages={state.fieldErrors?.confirmPassword} />
          </div>
        </CardContent>
        <CardFooter className="border-border/60 mt-2 border-t pt-4">
          <SubmitButton className="sm:w-auto">Update password</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
