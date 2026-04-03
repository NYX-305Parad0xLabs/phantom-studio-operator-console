import { expect, test } from "@playwright/test";

test("loads the dashboard shell", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("text=Dashboard")).toBeVisible();
});
