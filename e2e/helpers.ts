import { expect, type Page } from "@playwright/test";

const MAILPIT_URL = process.env.MAILPIT_URL ?? "http://localhost:8025";

type MailpitSummary = { ID: string };

/** Unique per test run so parallel tests and re-runs never collide. */
export function uniqueEmail(prefix: string, domain = "studbocconi.it") {
  return `${prefix}.${Date.now()}${Math.floor(Math.random() * 1e6)}@${domain}`;
}

/** A distinct client IP per test, so tests don't share a rate-limit bucket. */
export function uniqueIp() {
  const n = () => Math.floor(Math.random() * 250) + 1;
  return `10.${n()}.${n()}.${n()}`;
}

export async function mailsTo(email: string): Promise<MailpitSummary[]> {
  const res = await fetch(
    `${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`,
  );
  if (!res.ok) throw new Error(`Mailpit search failed: ${res.status}`);
  return ((await res.json()) as { messages: MailpitSummary[] }).messages;
}

/** Waits for the latest magic-link email to `email` and returns the link. */
export async function magicLinkFor(email: string, previous = 0): Promise<string> {
  let messages: MailpitSummary[] = [];
  await expect
    .poll(async () => (messages = await mailsTo(email)).length, { timeout: 15_000 })
    .toBeGreaterThan(previous);
  // Mailpit returns newest first.
  const res = await fetch(`${MAILPIT_URL}/api/v1/message/${messages[0].ID}`);
  const { Text } = (await res.json()) as { Text: string };
  const link = Text.match(/https?:\/\/\S+\/magic-link\/verify\S+/)?.[0];
  if (!link) throw new Error(`No magic link in email to ${email}:\n${Text}`);
  return link;
}

/** Requests a link through the UI and opens it. Ends on whatever page the link redirects to. */
export async function signIn(page: Page, email: string) {
  const previous = (await mailsTo(email)).length;
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Email me a sign-in link" }).click();
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
  await page.goto(await magicLinkFor(email, previous));
}

/** Signs in a new student and completes onboarding as year 1. Ends on /courses. */
export async function signInAsNewStudent(page: Page, email: string) {
  await signIn(page, email);
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByLabel("Year 1").check();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/courses$/);
}
