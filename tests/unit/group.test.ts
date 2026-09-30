import { describe, expect, it } from "vitest";
import { groupBySemester } from "@/lib/courses/group";

describe("groupBySemester", () => {
  it("puts semester 1 first, keeps course order within a group, unknown last", () => {
    const groups = groupBySemester([
      { slug: "stats", semester: 2 },
      { slug: "x", semester: null },
      { slug: "micro", semester: 1 },
      { slug: "math", semester: 1 },
    ]);
    expect(groups.map((g) => [g.semester, g.courses.map((c) => c.slug)])).toEqual([
      [1, ["micro", "math"]],
      [2, ["stats"]],
      [null, ["x"]],
    ]);
  });
});
