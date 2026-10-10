# ADR-0008 — Versões, releases e a página "Em breve"

- **Status:** aceito (decidido pelo usuário em 2026-10-06: F4-A, F5-A)
- **Data:** 2026-10-06

## Contexto
O Codetomb é uma rede aberta: qualquer pessoa da internet pode se cadastrar na produção. A moderação só fica pronta na M5. Ao mesmo tempo, o caminho de deploy da produção precisa ser testado desde cedo.

## Decisão
- **SemVer**, com a versão escolhida e publicada **só pelo usuário** (`gh release create vX.Y.Z --target main --generate-notes`), igual ao Orçô.
- Uma meta de versão por fase: M0 `0.1.0`, M1 `0.2.0`, M2 `0.3.0`, M3 `0.4.0`, M4 `0.5.0`, M5 `0.6.0` e M6 **`1.0.0`**.
- **Até a `v1.0.0`, a produção mostra só a página "Em breve".** As releases `v0.x` vão para a produção, para testar o caminho, mas o produto só é usado no staging.
- O "Em breve" é ligado por configuração do ambiente e desligado na `v1.0.0`.

## Como ficou (NBB-106, decidido pelo usuário em 2026-10-10)
- **Fechado por padrão (E3-A):** na produção (`APP_ENV=production`), o site só abre com `PUBLIC_LAUNCH=true` no `.env`. Sem a variável, ou com qualquer outro valor, aparece o "Em breve". Um `.env` incompleto deixa o site fechado, nunca aberto sem querer. Local e staging nunca mostram o "Em breve". A regra fica em `src/lib/launch.ts`.
- **Toda rota mostra o "Em breve" (E4-A):** o `src/proxy.ts` reescreve qualquer endereço para `/em-breve`, com `X-Robots-Tag: noindex, nofollow` e a CSP de sempre. O favicon e os arquivos estáticos continuam funcionando.
- **Texto:** "🪦 Codetomb" e "O cemitério de projetos dos desenvolvedores abre em breve. Ainda estamos cavando.", com a versão no rodapé (E6-A).
- **Para lançar:** acrescentar `PUBLIC_LAUNCH=true` ao `.env` da produção e recriar o app (`deploy/README.md`, "Lançamento").

## Alternativas descartadas
- Abrir a produção conforme as fases ficam prontas (F5-B): gente se cadastrando numa rede sem moderação.

## Consequências
- O staging precisa ser o lugar de teste de verdade (com Basic Auth e dados fictícios).
- Na `v1.0.0`, o checklist de lançamento inclui desligar o "Em breve" (`PUBLIC_LAUNCH=true`).
