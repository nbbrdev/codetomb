# ADR-0001 — Stack base igual à do Orçô

- **Status:** aceito (decidido pelo usuário em 2026-10-05: P1-A, P4-A, P5-A)
- **Data:** 2026-10-05

## Contexto
O Codetomb é um projeto pequeno, feito para ganhar experiência. O usuário já colocou o Orçô em produção com Next.js na mesma VPS. Aprender uma stack nova ao mesmo tempo que um produto novo dobra o esforço.

## Decisão
- **Next.js 16** (App Router, Server Components, Server Actions, `proxy.ts`), React 19.
- **TypeScript `strict`**, **Node 24 LTS**, **npm**.
- **Tailwind CSS 4**, **shadcn/ui** e lucide-react.
- **React Hook Form** e **Zod**, com os mesmos schemas no navegador e no servidor.
- **Vitest** (unidade e integração com banco real) e **Playwright** (E2E).
- Pastas por funcionalidade: `src/features/<assunto>/`.

## Alternativas descartadas
- Outra stack (Remix, SvelteKit, um backend separado): mais coisa nova para aprender sem ganho claro para o produto.
- Testes só de unidade e E2E: deixariam de fora os testes de permissão no banco, que são os mais importantes numa rede social.

## Consequências
- O modelo de `CLAUDE.md`, as lições do Orçô e boa parte da configuração (CI, Docker, deploy) são reaproveitados.
- Next 16 tem mudanças recentes: consultar `node_modules/next/dist/docs/` antes de escrever código.
