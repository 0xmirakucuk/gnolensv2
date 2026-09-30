import path from "node:path";
import { loadSyllabusDir } from "@/lib/syllabus/load";
import { expect, test } from "./fixtures";
import { signInAsNewStudent, uniqueEmail } from "./helpers";

test("a signed-in student sees the three courses and their units and parts", async ({ page }) => {
  const syllabus = await loadSyllabusDir(path.join(process.cwd(), "content/syllabus"));
  expect(syllabus).toHaveLength(3);

  await signInAsNewStudent(page, uniqueEmail("courses"));
  await expect(page.getByRole("heading", { name: "Courses" })).toBeVisible();

  const cards = page.getByRole("main").getByRole("listitem").getByRole("link");
  await expect(cards).toHaveCount(3);

  for (const course of syllabus) {
    await page.goto("/courses");
    await page.getByRole("link", { name: new RegExp(escape(course.name)) }).click();
    await expect(page).toHaveURL(`/courses/${course.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(course.name);

    const units = page.getByTestId("unit");
    await expect(units).toHaveCount(course.units.length);
    for (const [i, unit] of course.units.entries()) {
      await expect(units.nth(i).getByRole("heading")).toContainText(unit.title);
      await expect(units.nth(i).getByTestId("part")).toHaveText(
        unit.parts.map((p) => new RegExp(escape(p.title))),
      );
    }
  }
});

test("an unknown course shows not found", async ({ page }) => {
  await signInAsNewStudent(page, uniqueEmail("notfound"));
  await page.goto("/courses/does-not-exist");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
