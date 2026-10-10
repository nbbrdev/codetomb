import { NextResponse, type NextRequest } from "next/server";

import { getAppEnv } from "@/lib/app-env";
import { isAuthorized } from "@/lib/basic-auth";
import { isComingSoon } from "@/lib/launch";
import { buildCsp, createNonce } from "@/lib/security/csp";

// Buscadores não devem indexar o staging nem a página provisória "Em breve".
const NOINDEX = "noindex, nofollow";
// Rota interna da página "Em breve" (src/app/em-breve/page.tsx).
const COMING_SOON_PATH = "/em-breve";

// Proxy do Next 16 (antigo middleware.ts): roda antes de cada rota que casa com o matcher.
export function proxy(request: NextRequest) {
  const appEnv = getAppEnv();
  const isStaging = appEnv === "staging";

  // Staging: senha do navegador em todas as rotas (docs/07-seguranca.md §9, NBB-106 E5-A).
  if (isStaging) {
    const user = process.env.STAGING_BASIC_AUTH_USER;
    const password = process.env.STAGING_BASIC_AUTH_PASSWORD;

    // Sem credenciais configuradas, o staging fica fechado (nunca aberto por esquecimento).
    if (!user || !password) {
      return new NextResponse("Staging sem credenciais configuradas.", {
        status: 503,
        headers: { "X-Robots-Tag": NOINDEX },
      });
    }

    if (!isAuthorized(request.headers.get("authorization"), user, password)) {
      return new NextResponse("Autenticação necessária.", {
        status: 401,
        headers: {
          // Header HTTP: só ASCII no realm (acentos aparecem quebrados em alguns navegadores).
          "WWW-Authenticate": 'Basic realm="Codetomb staging", charset="UTF-8"',
          "X-Robots-Tag": NOINDEX,
        },
      });
    }
  }

  // CSP com nonce novo a cada requisição (docs/07-seguranca.md §7). Vai nos headers da REQUISIÇÃO,
  // de onde o Next extrai o nonce para marcar os próprios scripts, e nos da RESPOSTA, que o
  // navegador aplica.
  const nonce = createNonce();
  const csp = buildCsp({ nonce, appEnv });
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  // Produção antes do lançamento: toda rota mostra o "Em breve" (ADR-0008, NBB-106 E3-A e E4-A).
  const comingSoon = isComingSoon(appEnv);
  const response = comingSoon
    ? NextResponse.rewrite(new URL(COMING_SOON_PATH, request.url), {
        request: { headers: requestHeaders },
      })
    : NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set("Content-Security-Policy", csp);
  if (isStaging || comingSoon) {
    response.headers.set("X-Robots-Tag", NOINDEX);
  }
  return response;
}

export const config = {
  // Sem excluir prefetches (a doc do Next sugere): no staging, eles escapariam do Basic Auth.
  matcher: [
    // Tudo, exceto arquivos estáticos e de otimização de imagem do Next, favicon e imagens.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
