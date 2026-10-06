import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { proxy } from "@/proxy";

function nonceOf(csp: string | null): string | undefined {
  return csp?.match(/'nonce-([^']+)'/)?.[1];
}

function request(path: string): NextRequest {
  return new NextRequest(`https://codetomb.nbbrdev.com${path}`);
}

describe("proxy", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sends a CSP with a fresh nonce on every response", () => {
    vi.stubEnv("APP_ENV", "production");
    const first = nonceOf(proxy(request("/")).headers.get("Content-Security-Policy"));
    const second = nonceOf(proxy(request("/")).headers.get("Content-Security-Policy"));

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(first).not.toBe(second);
  });

  it("hands the same nonce to Next.js through the request headers", () => {
    vi.stubEnv("APP_ENV", "production");
    const response = proxy(request("/"));

    // O Next repassa os headers alterados da requisição por "x-middleware-request-<nome>".
    const responseNonce = nonceOf(response.headers.get("Content-Security-Policy"));
    expect(response.headers.get("x-middleware-request-x-nonce")).toBe(responseNonce);
    expect(nonceOf(response.headers.get("x-middleware-request-content-security-policy"))).toBe(
      responseNonce,
    );
  });

  it("lets the request through", () => {
    vi.stubEnv("APP_ENV", "production");
    expect(proxy(request("/")).status).toBe(200);
  });
});
