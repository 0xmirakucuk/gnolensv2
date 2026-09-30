import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { saveYear } from "./actions";

export const metadata: Metadata = { title: "Welcome" };

const YEARS = [1, 2, 3] as const;

export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const user = await requireUser();
  const { error } = await searchParams;

  return (
    <Card className="mx-auto w-full max-w-md gap-6 p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-heading-4">Welcome</h1>
        <p className="text-body-md text-slate">
          Which BEMACS year are you in? You can change it later.
        </p>
      </div>
      <form action={saveYear} className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">Year</legend>
          {YEARS.map((year) => (
            <label
              key={year}
              className="border-hairline-strong text-body-md has-checked:border-primary flex h-11 cursor-pointer items-center gap-3 rounded-md border px-4 transition-[border-color,box-shadow] duration-150 has-checked:shadow-[inset_0_0_0_1px_var(--color-primary)]"
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
          <p role="alert" className="text-body-sm text-error">
            Choose your year to continue.
          </p>
        )}
        <Button type="submit" size="lg">
          Continue
        </Button>
      </form>
    </Card>
  );
}
