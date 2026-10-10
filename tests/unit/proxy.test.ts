import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { proxy } from "@/proxy";

function nonceOf(csp: string | null): string | undefined {
  return csp?.match(/'nonce-([^']+)'/)?.[1];
}

function request(path: string, credentials?: string): NextRequest {
  const headers = new Headers();
  if (credentials) {
    headers.set("authorization", `Basic ${Buffer.from(credentials).toString("base64")}`);
  }
  return new NextRequest(`https://codetomb.nbbrdev.com${path}`, { headers });
}

/** Para onde o Next vai reescrever a requisição (header interno do NextResponse.rewrite). */
function rewriteTarget(response: Response): string | null {
  const target = response.headers.get("x-middleware-rewrite");
  return target ? new URL(target).pathname : null;
}

describe("proxy", () => {
  beforeEach(() => {
    vi.stubEnv("STAGING_BASIC_AUTH_USER", "tester");
    vi.stubEnv("STAGING_BASIC_AUTH_PASSWORD", "s3nha");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("content security policy", () => {
    beforeEach(() => {
      vi.stubEnv("APP_ENV", "production");
      vi.stubEnv("PUBLIC_LAUNCH", "true");
    });

    it("sends a CSP with a fresh nonce on every response", () => {
      const first = nonceOf(proxy(request("/")).headers.get("Content-Security-Policy"));
      const second = nonceOf(proxy(request("/")).headers.get("Content-Security-Policy"));

      expect(first).toBeDefined();
      expect(second).toBeDefined();
      expect(first).not.toBe(second);
    });

    it("hands the same nonce to Next.js through the request headers", () => {
      const response = proxy(request("/"));

      // O Next repassa os headers alterados da requisição por "x-middleware-request-<nome>".
      const responseNonce = nonceOf(response.headers.get("Content-Security-Policy"));
      expect(response.headers.get("x-middleware-request-x-nonce")).toBe(responseNonce);
      expect(nonceOf(response.headers.get("x-middleware-request-content-security-policy"))).toBe(
        responseNonce,
      );
    });
  });

  describe("in development", () => {
    it("lets every request through, without noindex", () => {
      vi.stubEnv("APP_ENV", "development");
      const response = proxy(request("/"));
      expect(response.status).toBe(200);
      expect(rewriteTarget(response)).toBeNull();
      expect(response.headers.get("X-Robots-Tag")).toBeNull();
    });
  });

  describe("in staging", () => {
    beforeEach(() => {
      vi.stubEnv("APP_ENV", "staging");
    });

    it("stays closed (503) when credentials are not configured", () => {
      vi.stubEnv("STAGING_BASIC_AUTH_PASSWORD", "");
      const response = proxy(request("/"));
      expect(response.status).toBe(503);
      expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    });

    it("asks for a password (401) without credentials", () => {
      const response = proxy(request("/"));
      expect(response.status).toBe(401);
      expect(response.headers.get("WWW-Authenticate")).toContain("Basic");
      expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    });

    it("rejects wrong credentials", () => {
      expect(proxy(request("/", "tester:errada")).status).toBe(401);
    });

    it("protects every route, with no exceptions (E5-A)", () => {
      for (const path of ["/", "/em-breve", "/api/auth/callback/github", "/qualquer"]) {
        expect(proxy(request(path)).status, path).toBe(401);
      }
    });

    it("lets the right credentials through, marked noindex", () => {
      const response = proxy(request("/", "tester:s3nha"));
      expect(response.status).toBe(200);
      expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    });

    it("never shows the coming soon page", () => {
      const response = proxy(request("/", "tester:s3nha"));
      expect(rewriteTarget(response)).toBeNull();
    });
  });

  describe("in production", () => {
    beforeEach(() => {
      vi.stubEnv("APP_ENV", "production");
    });

    it("shows the coming soon page on every route before the launch, marked noindex", () => {
      for (const path of ["/", "/entrar", "/projetos/123"]) {
        const response = proxy(request(path));
        expect(rewriteTarget(response), path).toBe("/em-breve");
        expect(response.headers.get("X-Robots-Tag"), path).toBe("noindex, nofollow");
      }
    });

    it("keeps the CSP on the coming soon page", () => {
      const response = proxy(request("/"));
      expect(nonceOf(response.headers.get("Content-Security-Policy"))).toBeDefined();
    });

    it("opens the site only with PUBLIC_LAUNCH=true", () => {
      vi.stubEnv("PUBLIC_LAUNCH", "true");
      const response = proxy(request("/"));
      expect(rewriteTarget(response)).toBeNull();
      expect(response.headers.get("X-Robots-Tag")).toBeNull();
    });

    it("does not ask for the staging password", () => {
      vi.stubEnv("PUBLIC_LAUNCH", "true");
      expect(proxy(request("/")).status).toBe(200);
    });
  });
});
