import { expect, test } from "@playwright/test";

// Identidade visual (NBB-105, docs/12-identidade-visual.md).

test.describe("automatic theme (V7-A)", () => {
  test("follows a light system preference", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(245, 246, 242)");
  });

  test("follows a dark system preference", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(16, 19, 15)");
  });
});

test("announces the provisional favicon (V5-A)", async ({ page, request }) => {
  await page.goto("/");
  const href = await page.locator('link[rel="icon"][type="image/svg+xml"]').getAttribute("href");
  expect(href).toMatch(/^\/icon\.svg/);

  const icon = await request.get(href ?? "");
  expect(icon.ok()).toBe(true);
  expect(icon.headers()["content-type"]).toContain("image/svg+xml");
});

test("sets headings in Fraunces (V3-B)", async ({ page }) => {
  await page.goto("/");
  const family = await page
    .getByRole("heading", { level: 1 })
    .evaluate((element) => getComputedStyle(element).fontFamily);
  expect(family).toMatch(/Fraunces/);
});
