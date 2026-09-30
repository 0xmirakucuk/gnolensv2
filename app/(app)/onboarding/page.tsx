import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { saveYear } from "./actions";

export const metadata: Metadata = { title: "Welcome" };

const YEARS = [1, 2, 3] as const;

export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const user = await requireUser();
  const { error } = await searchParams;

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>
          <h1 className="text-xl">Welcome</h1>
        </CardTitle>
        <CardDescription>Which BEMACS year are you in? You can change it later.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={saveYear} className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">Year</legend>
            {YEARS.map((year) => (
              <label
                key={year}
                className="has-checked:border-primary has-checked:bg-accent flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm"
              >
                <input
                  type="radio"
                  name="year"
                  value={year}
                  defaultChecked={user.year === year}
                  required
                  className="accent-primary"
                />
                Year {year}
              </label>
            ))}
          </fieldset>
          {error && (
            <p role="alert" className="text-destructive text-sm">
              Choose your year to continue.
            </p>
          )}
          <Button type="submit">Continue</Button>
        </form>
      </CardContent>
    </Card>
  );
}
