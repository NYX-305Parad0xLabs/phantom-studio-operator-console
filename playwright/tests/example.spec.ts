import { expect, test } from "@playwright/test";

test("loads the dashboard shell", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByText("Live status across ingestion, clips, QA, and exports."),
  ).toBeVisible();
});
