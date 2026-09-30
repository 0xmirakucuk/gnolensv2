import { config } from "dotenv";
import { defineConfig, devices } from "@playwright/test";
import { E2E_ADMIN_EMAIL } from "./e2e/constants";

config({ path: [".env.local", ".env"], quiet: true });

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

if (!process.env.TEST_DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL is required for e2e tests (see .env.example).");
}

export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    // Optional: use a preinstalled Chromium instead of `playwright install` (sandboxed envs).
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : {},
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Production build against the test database: the same code path as a deploy.
    command: `pnpm build && pnpm start --port ${PORT}`,
    url: `${baseURL}/sign-in`,
    timeout: 240_000,
    reuseExistingServer: false,
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL,
      BETTER_AUTH_URL: baseURL,
      ADMIN_EMAILS: E2E_ADMIN_EMAIL,
      RESEND_API_KEY: "",
    },
  },
});
