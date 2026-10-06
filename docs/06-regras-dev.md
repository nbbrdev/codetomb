# 06 — Regras de desenvolvimento e processo

> Status: rascunho para validação, baseado no processo do Orçô · Última atualização: 2026-10-06

## 1. Fontes da verdade

| O quê | Onde |
|---|---|
| Conteúdo: escopo, regras, fluxos, arquitetura, dados, segurança | `docs/` no repositório |
| Planejamento e andamento: fases, marcos, issues, status | Linear, projeto **Codetomb** (time Nbbr dev, chave `NBB`) |
| Espelho dos docs para ler e comentar | Linear Docs do projeto |

- Uma mudança em `docs/` é refletida no Linear Doc correspondente **na mesma sessão**, e vice-versa.
- Mudança de escopo atualiza [02-escopo.md](02-escopo.md). Decisão técnica gera um ADR em [decisoes/](decisoes/).
- **Nada é implementado fora do escopo.** Ideias novas viram issue no **Backlog, sem marco**, até o usuário promovê-las.
- Regras (`RN`), requisitos (`RF`/`RNF`), fluxos (`F`) e ADRs **nunca são renumerados**. Os revogados ficam riscados.

## 1.1 Regras de trabalho com agentes de IA

Definidas pelo usuário e válidas para qualquer agente (ex.: Claude Code) que trabalhe no repositório. O processo completo está na skill `modo-de-trabalho`.

| # | Regra |
|---|---|
| RT-01 | Criar e editar arquivos **somente** com as ferramentas de edição do agente (Write/Edit), para cada mudança aparecer como diff. **Proibido** usar scripts Python, `sed`, `awk`, heredocs ou redirecionamento de shell para modificar arquivos. Exceções: geradores e CLIs oficiais (`create-next-app`, `shadcn add`, `drizzle-kit generate`, `npm install` para o lockfile) e o Prettier (só forma). Arquivo binário só com autorização. |
| RT-02 | **Código sempre em inglês**: variáveis, funções, tipos, arquivos de código, tabelas e colunas. Textos da interface, URLs e mensagens ao usuário final em pt-BR. |
| RT-03 | O agente **não toma nenhuma decisão sozinho, nem as pequenas** (valores, limites, nomes, textos, labels, regras novas, configurações extras). Para cada uma: o problema, as opções com prós e contras e uma recomendação; o usuário decide **antes** de o agente escrever. O que escapar é apontado em "Pontos para revisar" no PR. O que o usuário não confirmou fica como ⏳ proposto. |
| RT-04 | **Eu implemento, o usuário revisa:** um PR por issue, merge (squash) só depois do OK do usuário, e quem clica no merge é ele. Releases só o usuário publica. |

## 2. Filtro de simplicidade

Antes de qualquer feature ou PR: **isso adiciona passo, campo obrigatório ou tela ao fluxo principal?** Se sim, precisa de justificativa na issue e de aprovação. Na dúvida, fica de fora ([01-visao.md](01-visao.md)).

## 3. Linear

- Toda tarefa de código tem uma issue, com marco (fase), **um label de Área** (`Docs`, `Frontend`, `Backend`, `Database`, `Infra`, `Security`, `UX`) e, quando couber, um tipo (`Feature`, `Bug`, `Improvement`).
- A descrição traz o contexto, as referências (RN/RF/F), a seção **"Decisões (data)"** com os códigos (ex.: `D1-A`) e um checklist.
- Status: `Backlog` → `Todo` → `In Progress` → `Done`. O PR aberto move para In Progress, e o merge move para Done, **mesmo que ainda falte algo**: nesse caso, reabrir para In Progress.

## 4. Git e GitHub

- `main` **protegida**, inclusive para administradores: PR obrigatório, checks `ci`, `codeql` e `pr-title` verdes, branch em dia com a `main`, histórico linear, conversas resolvidas, sem force push nem exclusão. Aprovações exigidas: 0 (conta única; a revisão acontece na conversa).
- Merge **só squash**, com o título do PR e sem corpo; a branch é apagada sozinha.
- Branch: `<tipo>/<ID>-<descricao-curta>`, ex.: `feat/NBB-120-postar-projeto`.
- Commits e títulos de PR em **Conventional Commits**, em pt-BR, com o ID do Linear:
  `feat(projects): adiciona galeria de imagens [NBB-120]`
  Tipos: `feat`, `fix`, `perf`, `security`, `docs`, `refactor`, `test`, `chore`, `ci`.
- Corpo do PR pelo modelo `.github/PULL_REQUEST_TEMPLATE.md`, com a seção **"Pontos para revisar (decididos por mim)"**.

## 4.1 Versões e releases ([ADR-0008](decisoes/0008-versionamento-releases-e-em-breve.md))

- **Merge na `main` = deploy automático no staging.** Produção só recebe **versões criadas pelo usuário** (`gh release create vX.Y.Z --target main --generate-notes`). O agente nunca cria tag nem release.
- SemVer: algum `feat` → sobe o minor; só `fix`/`perf`/`security` → sobe o patch; `1.0.0` no lançamento.
- Antes de publicar: CI verde no último commit da `main` e, a partir da primeira release depois da `v1.0.0`, backup do banco da produção (I6-A).
- A versão é a tag: sem `version` no `package.json` e sem `CHANGELOG.md`. O app mostra a versão por `NEXT_PUBLIC_APP_VERSION`, injetada no build.

## 5. Código

- TypeScript `strict` e `noUncheckedIndexedAccess`. Sem `any` (use `unknown` com Zod).
- ESLint e Prettier; o CI falha com warning.
- Organização por funcionalidade em `src/features/<assunto>/` (P5-A).
- Server Components por padrão; `"use client"` só onde há interação.
- Mutações só por **Server Actions** (ou Route Handlers para arquivos). Nunca escrever no banco a partir do navegador.
- Server Actions são uma **casca fina**: leem a sessão e chamam um arquivo com a regra, que o Vitest testa.
- Módulos com segredo ou acesso direto a banco, arquivos e e-mail começam com `import "server-only"`.
- Visual só pelos tokens de [12-identidade-visual.md](12-identidade-visual.md); nada de cor literal em componente.
- Acessibilidade: todo campo com label, todo botão-ícone com `aria-label`.
- **Next.js 16:** consultar `node_modules/next/dist/docs/` antes de escrever código de Next.

## 6. Banco

- **PostgreSQL 17 com Drizzle** ([ADR-0003](decisoes/0003-banco-drizzle-rls-roles.md)).
- Fluxo de uma mudança: editar o schema → `npm run db:generate -- <nome>` → **revisar o SQL** (RLS, policies, grants e funções podem ser escritos à mão na migration) → `npm run db:reset` para testar do zero.
- Tabela nova = `ENABLE` e `FORCE ROW LEVEL SECURITY`, policies, grants e **teste de RLS**, no mesmo PR, e [05-dados.md](05-dados.md) atualizado.
- Uma migration aplicada nunca é editada. Toda migration é compatível com a versão anterior do código (o banco muda antes do código no deploy).
- Nunca alterar o banco do staging ou da produção à mão. A única exceção é o comando SQL documentado para promover um admin (RN-37).
- O app roda localmente em `http://localhost:3010` (`npm run dev` e `npm run start`; NBB-102 D3-A). As portas locais do Postgres, do RustFS e do Mailpit são decididas na issue do banco local, para não colidirem com as do Orçô.

## 7. Testes

| Tipo | O que testa | Ferramenta e pasta |
|---|---|---|
| **Unitário** | funções isoladas: schemas Zod, pontuação do "em alta", Markdown seguro, CSP | Vitest, `tests/unit/` |
| **Integração** | o código com **Postgres e RustFS reais**: RLS, roles, funções, limites, upload, e-mail pelo Mailpit | Vitest, `tests/integration/` |
| **E2E** | fluxos inteiros no navegador (RNF-07) | Playwright, `tests/e2e/` |

**Como rodar:**

| Comando | Roda |
|---|---|
| `npm test` | só os unitários (o do dia a dia) |
| `npm run test:watch` | unitários, repetindo a cada alteração |
| `npm run test:integration` | só a integração (a partir da NBB-104, com o banco local ligado) |
| `npm run test:e2e` | E2E com o Playwright (precisa de `npm run build` antes; na primeira vez, `npx playwright install chromium`) |

- Bug corrigido = teste que reproduz o bug.
- Dados sempre fictícios (`@example.com`), nunca reais.
- Testes de integração criam e apagam o que usam, sem depender da ordem.
- A trava de cobertura do CI é decidida na issue dos workflows.

## 8. Variáveis de ambiente

Listadas, sem valores, em `.env.example` e `deploy/env.example`. Segredos só no `.env.local` de quem desenvolve e nos `.env` da VPS. A lista completa nasce com cada funcionalidade. As previstas são:

| Variável | Segredo? |
|---|---|
| `APP_ENV` (`development`, `staging`, `production`), `SITE_URL` | não |
| `DATABASE_URL_APP`, `DATABASE_URL_AUTH`, `DATABASE_URL_OWNER` (só no serviço `migrate`) | **sim** |
| `BETTER_AUTH_SECRET` | **sim** |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (uma OAuth App por ambiente, I7-A) | **sim** |
| `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | **sim** |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM` | **sim** |
| `STAGING_BASIC_AUTH_USER`, `STAGING_BASIC_AUTH_PASSWORD` (só no staging) | **sim** |
| `NEXT_PUBLIC_APP_VERSION` (injetada no build) | não |

## 9. Definição de pronto (DoD)

- [ ] Checklist da issue atendido
- [ ] Testes escritos e passando; CI e CodeQL verdes
- [ ] Checklist de segurança do PR ok
- [ ] Testado no celular (360 px) e no computador, em tema claro e escuro
- [ ] `docs/` e Linear Docs atualizados, se algo mudou
- [ ] Testado localmente antes do merge e conferido no staging depois (não há preview por PR)
