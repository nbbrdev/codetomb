import { defineConfig, devices } from "@playwright/test";

// Testes E2E (docs/06-regras-dev.md §7): o app de verdade no navegador. Só o Chromium, em computador
// e num celular emulado. O app sobe com `next start` (precisa do `npm run build` antes).
const PORT = 3010;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run start",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
