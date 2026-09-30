import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  SyllabusError,
  assertUniqueCourses,
  loadSyllabusDir,
  parseSyllabusFile,
} from "@/lib/syllabus/load";

const valid = `
slug: micro
name: Microeconomics
code: "30403"
year: 1
order: 1
units:
  - slug: u1
    title: Consumer choice
    parts:
      - slug: p1
        title: Preferences
      - slug: p2
        title: Budget constraint
  - slug: u2
    title: Production
    parts:
      - slug: p1
        title: Costs
`;

describe("parseSyllabusFile", () => {
  it("expands local slugs to global ones and assigns 1-based order", () => {
    const course = parseSyllabusFile("micro.yaml", valid);
    expect(course).toMatchObject({
      slug: "micro",
      code: "30403",
      draft: false,
    });
    expect(course.units.map((u) => [u.slug, u.order])).toEqual([
      ["micro.u1", 1],
      ["micro.u2", 2],
    ]);
    expect(course.units[0].parts.map((p) => [p.slug, p.order])).toEqual([
      ["micro.u1.p1", 1],
      ["micro.u1.p2", 2],
    ]);
  });

  it("names the file and path of a missing field", () => {
    const text = valid.replace("        title: Budget constraint\n", "");
    expect(() => parseSyllabusFile("micro.yaml", text)).toThrow(
      /micro\.yaml: units\[0\]\.parts\[1\]\.title/,
    );
  });

  it("rejects duplicate unit slugs", () => {
    const text = valid.replace("slug: u2", "slug: u1");
    expect(() => parseSyllabusFile("micro.yaml", text)).toThrow(/duplicate unit slug "u1"/);
  });

  it("rejects duplicate part slugs within a unit", () => {
    const text = valid.replace("slug: p2", "slug: p1");
    expect(() => parseSyllabusFile("micro.yaml", text)).toThrow(
      /duplicate part slug "p1" in unit "u1"/,
    );
  });

  it.each(["Micro", "u 1", "u.1", "u_1", "-u1"])("rejects bad slug %j", (slug) => {
    const text = valid.replace("slug: u1", `slug: "${slug}"`);
    expect(() => parseSyllabusFile("micro.yaml", text)).toThrow(SyllabusError);
  });

  it("rejects unknown keys (catches typos like 'part:')", () => {
    const text = valid.replace("order: 1\n", "order: 1\nteacher: someone\n");
    expect(() => parseSyllabusFile("micro.yaml", text)).toThrow(/teacher/);
  });

  it("requires the file name to match the course slug", () => {
    expect(() => parseSyllabusFile("microeconomics.yaml", valid)).toThrow(
      /must match the file name/,
    );
  });

  it("reports invalid YAML with the file name", () => {
    expect(() => parseSyllabusFile("micro.yaml", "units: [unclosed")).toThrow(
      /micro\.yaml: invalid YAML/,
    );
  });

  it("rejects a unit without parts", () => {
    const text = `slug: x\nname: X\nyear: 1\norder: 1\nunits:\n  - slug: u1\n    title: T\n    parts: []\n`;
    expect(() => parseSyllabusFile("x.yaml", text)).toThrow(/at least one part/);
  });
});

describe("assertUniqueCourses", () => {
  it("rejects two courses with the same order", () => {
    const a = parseSyllabusFile("micro.yaml", valid);
    const b = { ...a, slug: "math" };
    expect(() => assertUniqueCourses([a, b])).toThrow(/both have order 1/);
  });
});

describe("content/syllabus", () => {
  it("the committed syllabus files are valid", async () => {
    const courses = await loadSyllabusDir(path.join(process.cwd(), "content/syllabus"));
    expect(courses.map((c) => c.slug)).toEqual(["micro", "math", "cs"]);
    expect(courses.map((c) => c.code)).toEqual(["30403", "30400", "30398"]);
  });
});
