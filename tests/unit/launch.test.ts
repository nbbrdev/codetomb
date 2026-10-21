import { describe, expect, it } from "vitest";

import { isComingSoon } from "@/lib/launch";

describe("isComingSoon (ADR-0008, NBB-106 E3-A)", () => {
  it("closes production by default", () => {
    expect(isComingSoon("production", undefined)).toBe(true);
    expect(isComingSoon("production", "")).toBe(true);
  });

  it.each(["false", "1", "TRUE", "yes"])(
    "keeps production closed with PUBLIC_LAUNCH=%s",
    (value) => {
      expect(isComingSoon("production", value)).toBe(true);
    },
  );

  it("opens production only with PUBLIC_LAUNCH=true", () => {
    expect(isComingSoon("production", "true")).toBe(false);
  });

  it("never shows it in development", () => {
    expect(isComingSoon("development", undefined)).toBe(false);
  });
});
