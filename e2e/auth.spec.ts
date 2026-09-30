import { E2E_ADMIN_EMAIL } from "./constants";
import { expect, test } from "./fixtures";
import { magicLinkFor, mailsTo, signIn, signInAsNewStudent, uniqueEmail } from "./helpers";

test("signed-out visitors are sent to sign-in", async ({ page }) => {
  for (const path of ["/", "/courses", "/courses/micro", "/onboarding"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/sign-in$/);
  }
});

test("rejects emails outside @studbocconi.it and sends nothing", async ({ page }) => {
  for (const email of [
    uniqueEmail("outsider", "gmail.com"),
    uniqueEmail("lookalike", "studbocconi.it.evil.com"),
  ]) {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: "Email me a sign-in link" }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "Use your @studbocconi.it" }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/sign-in$/);
    expect(await mailsTo(email)).toHaveLength(0);
  }
});

test("a student signs in, picks a year, and signs out", async ({ page }) => {
  const email = uniqueEmail("student");
  await signInAsNewStudent(page, email);
  await expect(page.getByTestId("user-email")).toHaveText(email);
  await expect(page.getByText("Admin", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await page.goto("/courses");
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("a returning student skips onboarding", async ({ page }) => {
  const email = uniqueEmail("returning");
  await signInAsNewStudent(page, email);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);

  await signIn(page, email);
  await expect(page).toHaveURL(/\/courses$/);
});

test("a magic link works only once", async ({ page, browser }) => {
  const email = uniqueEmail("once");
  await signIn(page, email);
  await expect(page).toHaveURL(/\/onboarding$/);

  const other = await browser.newContext();
  const otherPage = await other.newPage();
  await otherPage.goto(await magicLinkFor(email));
  await expect(otherPage).toHaveURL(/\/sign-in\?error=/);
  await expect(
    otherPage.getByRole("alert").filter({ hasText: "expired or was already used" }),
  ).toBeVisible();
  await other.close();
});

test("an allowlisted admin outside the student domain can sign in", async ({ page }) => {
  await signIn(page, E2E_ADMIN_EMAIL);
  await expect(page).toHaveURL(/\/(onboarding|courses)$/);
  await expect(page.getByText("Admin", { exact: true })).toBeVisible();
});

test("limits sign-in links per address, whatever the client IP", async ({ page }) => {
  const email = uniqueEmail("flood");
  for (let i = 1; i <= 4; i++) {
    // New client IP each time: the per-IP limit alone would let all of these through.
    await page.context().setExtraHTTPHeaders({ "x-forwarded-for": `192.0.2.${i}` });
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: "Email me a sign-in link" }).click();
    if (i <= 3) {
      await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
    } else {
      await expect(
        page.getByRole("alert").filter({ hasText: "Too many sign-in links" }),
      ).toBeVisible();
    }
  }
  await expect.poll(async () => (await mailsTo(email)).length).toBe(3);
});
