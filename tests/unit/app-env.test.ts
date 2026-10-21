import { describe, expect, it } from "vitest";

import { getAppEnv } from "@/lib/app-env";

describe("getAppEnv", () => {
  it("defaults to development when unset or empty", () => {
    expect(getAppEnv(undefined)).toBe("development");
    expect(getAppEnv("")).toBe("development");
  });

  it.each(["development", "production"] as const)("accepts %s", (value) => {
    expect(getAppEnv(value)).toBe(value);
  });

  // Não há staging (ADR-0010): um .env antigo com APP_ENV=staging falha alto, em vez de virar outra coisa.
  it.each(["staging", "prod", "Production", "preview"])("rejects %s", (value) => {
    expect(() => getAppEnv(value)).toThrow(/APP_ENV inválido/);
  });
});
