import { defineConfig, devices } from "@playwright/test";

// Browser tests against a production build and a throwaway API with demo data
// (`npm run e2e:api`, see scripts/e2e-api.sh). README, «Pruebas E2E», has the steps.
const API_URL = process.env.E2E_API_URL ?? "http://localhost:8001";
const PORT = Number(process.env.E2E_PORT ?? 3200);

export default defineConfig({
  testDir: "./e2e",
  // Render's free plan isn't involved, but the first request to a route builds its cache.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  // The admin tests create data and walk a tournament's lifecycle in order.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "es-BO",
    timezoneId: "America/La_Paz",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // Where the system already has Chromium (e.g. Arch: /usr/bin/chromium) instead of
    // `npx playwright install chromium`.
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : {},
  },
  projects: [
    { name: "celular", use: { ...devices["Pixel 7"] } },
    {
      name: "pc",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  // Needs a build first (`npm run build`); `npm run e2e` does both.
  webServer: {
    command: `npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    env: { API_URL },
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
