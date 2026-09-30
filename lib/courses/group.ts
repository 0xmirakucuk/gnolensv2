/** Groups courses by semester: semester 1 first, then 2, then courses with no semester. */
export function groupBySemester<T extends { semester: number | null }>(courses: T[]) {
  const groups = new Map<number | null, T[]>();
  for (const course of courses) {
    const list = groups.get(course.semester) ?? [];
    list.push(course);
    groups.set(course.semester, list);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a ?? Infinity) - (b ?? Infinity))
    .map(([semester, items]) => ({ semester, courses: items }));
}
