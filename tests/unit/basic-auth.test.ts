import { describe, expect, it } from "vitest";

import { isAuthorized, safeEqual } from "@/lib/basic-auth";

function header(credentials: string): string {
  return `Basic ${Buffer.from(credentials).toString("base64")}`;
}

describe("safeEqual", () => {
  it("compares strings of any length", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abcd")).toBe(false);
    expect(safeEqual("", "")).toBe(true);
  });
});

describe("isAuthorized", () => {
  it("accepts the right user and password", () => {
    expect(isAuthorized(header("tester:s3nha"), "tester", "s3nha")).toBe(true);
  });

  it("accepts a password that contains ':' (RFC 7617)", () => {
    expect(isAuthorized(header("tester:a:b:c"), "tester", "a:b:c")).toBe(true);
  });

  it.each([
    ["no header", null],
    ["another scheme", "Bearer token"],
    ["wrong password", header("tester:errada")],
    ["wrong user", header("outro:s3nha")],
    ["no separator", header("testers3nha")],
  ])("rejects %s", (_case, authorization) => {
    expect(isAuthorized(authorization, "tester", "s3nha")).toBe(false);
  });
});
