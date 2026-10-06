// Headers de segurança fixos (iguais em toda resposta), aplicados pelo next.config.ts.
// A CSP muda a cada requisição (nonce) e por isso fica no proxy (src/lib/security/csp.ts).
// Regras em docs/07-seguranca.md §7.

type HeaderEntry = { key: string; value: string };
type HeaderRule = { source: string; headers: HeaderEntry[] };

const GLOBAL_HEADERS: HeaderEntry[] = [
  // Só HTTPS por 2 anos, inclusive subdomínios. Navegadores ignoram em http (localhost).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Nenhum site pode exibir o Codetomb num iframe (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // O navegador usa o tipo declarado, sem "adivinhar" (evita arquivo virar script).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Para outros sites, só a origem (sem caminho) e só em HTTPS.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Recursos que o Codetomb nunca usa ficam desligados para qualquer script.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Uma página de outro site aberta a partir do Codetomb (ou que o abriu) não alcança esta janela.
  // O login com o GitHub é por redirecionamento, não por pop-up, então não é afetado.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

export const securityHeaders: HeaderRule[] = [{ source: "/:path*", headers: GLOBAL_HEADERS }];
