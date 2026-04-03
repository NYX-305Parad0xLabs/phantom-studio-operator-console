import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "playwright/tests",
  timeout: 30_000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
