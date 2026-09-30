import { test as base } from "@playwright/test";
import { uniqueIp } from "./helpers";

/** Every test gets its own client IP (see uniqueIp). */
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.setExtraHTTPHeaders({ "x-forwarded-for": uniqueIp() });
    await use(context);
  },
});

export { expect } from "@playwright/test";
