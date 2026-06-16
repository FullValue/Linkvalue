"use client";

import { useActionState, useState } from "react";
import {
  updateUsernameAction,
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
import { profileHostHint } from "@/lib/site";

export function UpdateUsernameForm({ currentUsername }: { currentUsername: string }) {
  const [state, formAction] = useActionState<SettingsState, FormData>(
    updateUsernameAction,
    {},
  );
  const [value, setValue] = useState(currentUsername);
  const hint = profileHostHint();

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Public handle</CardTitle>
          <CardDescription>
            This is your public link. Changing it breaks any link you’ve already
            shared.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <FormError message={state.error} />
          <FormSuccess message={state.success} />
          <div className="grid gap-2">
            <Label htmlFor="username">Handle</Label>
            <div className="border-input focus-within:ring-ring flex items-stretch overflow-hidden rounded-md border focus-within:ring-2">
              {hint.before && (
                <span className="text-muted-foreground bg-muted/50 flex items-center border-r px-3 text-sm select-none">
                  {hint.before}
                </span>
              )}
              <Input
                id="username"
                name="username"
                value={value}
                onChange={(e) => setValue(e.target.value.toLowerCase())}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                className="rounded-none border-0 focus-visible:ring-0"
                required
              />
              {hint.after && (
                <span className="text-muted-foreground bg-muted/50 flex items-center border-l px-3 text-sm select-none">
                  {hint.after}
                </span>
              )}
            </div>
            <FieldError messages={state.fieldErrors?.username} />
          </div>
        </CardContent>
        <CardFooter className="border-border/60 mt-2 border-t pt-4">
          <SubmitButton className="sm:w-auto">Save handle</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
