import { NextResponse, type NextRequest } from "next/server";

import { getAppEnv } from "@/lib/app-env";
import { isComingSoon } from "@/lib/launch";
import { buildCsp, createNonce } from "@/lib/security/csp";

// Buscadores não devem indexar a página provisória "Em breve".
const NOINDEX = "noindex, nofollow";
// Rota interna da página "Em breve" (src/app/em-breve/page.tsx).
const COMING_SOON_PATH = "/em-breve";

// Proxy do Next 16 (antigo middleware.ts): roda antes de cada rota que casa com o matcher.
export function proxy(request: NextRequest) {
  const appEnv = getAppEnv();

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
  if (comingSoon) {
    response.headers.set("X-Robots-Tag", NOINDEX);
  }
  return response;
}

export const config = {
  matcher: [
    // Tudo, exceto arquivos estáticos e de otimização de imagem do Next, favicon e imagens.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
