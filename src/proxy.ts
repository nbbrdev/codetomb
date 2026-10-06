import { NextResponse, type NextRequest } from "next/server";

import { getAppEnv } from "@/lib/app-env";
import { buildCsp, createNonce } from "@/lib/security/csp";

// Proxy do Next 16 (antigo middleware.ts): roda antes de cada rota que casa com o matcher.
// O Basic Auth do staging e a página "Em breve" da produção entram na NBB-106.
export function proxy(request: NextRequest) {
  // CSP com nonce novo a cada requisição (docs/07-seguranca.md §7). Vai nos headers da REQUISIÇÃO,
  // de onde o Next extrai o nonce para marcar os próprios scripts, e nos da RESPOSTA, que o
  // navegador aplica.
  const nonce = createNonce();
  const csp = buildCsp({ nonce, appEnv: getAppEnv() });
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Sem excluir prefetches (a doc do Next sugere): no staging, eles escapariam do Basic Auth.
  matcher: [
    // Tudo, exceto arquivos estáticos e de otimização de imagem do Next, favicon e imagens.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
