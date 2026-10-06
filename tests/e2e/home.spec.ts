import { expect, test } from "@playwright/test";

test("shows the temporary home page with the security headers", async ({ page }) => {
  const response = await page.goto("/");

  await expect(page.getByRole("heading", { name: "🪦 Codetomb" })).toBeVisible();
  await expect(page.getByText("O cemitério de projetos dos desenvolvedores.")).toBeVisible();

  const csp = response?.headers()["content-security-policy"];
  expect(csp).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
  expect(response?.headers()["x-frame-options"]).toBe("DENY");
  expect(response?.headers()["x-powered-by"]).toBeUndefined();
});

test("runs the page scripts under the CSP (no violations)", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (message.text().includes("Content Security Policy")) {
      violations.push(message.text());
    }
  });

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  expect(violations).toEqual([]);
});
