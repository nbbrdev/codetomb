# Codetomb — instruções para agentes

@AGENTS.md

Rede social para desenvolvedores divulgarem projetos abandonados e o motivo, conversarem e, quem sabe, revivê-los em equipe (slug técnico `codetomb`). Next.js 16 + PostgreSQL 17 (Drizzle, RLS) + Better Auth + RustFS, numa **VPS própria com Docker Compose e Nginx** (a mesma do Orçô; guia da máquina no repositório privado `nbbrdev/vps`).
Produção: <https://codetomb.nbbrdev.com> ("Em breve" até a `v1.0.0`) · Staging: <https://staging.codetomb.nbbrdev.com> · Repo: `nbbrdev/codetomb` (público) · Linear: time "Nbbr dev" (chave `NBB`), projeto "Codetomb".

## Fontes da verdade
- **Conteúdo:** `docs/`. Leia `docs/README.md` primeiro. Escopo em `docs/02-escopo.md`: **nada fora dele é implementado**.
- **Planejamento:** Linear, time "Nbbr dev", projeto "Codetomb". Toda tarefa de código tem issue; branches e commits citam o ID.
- Mudou `docs/`? Atualize o Linear Doc correspondente na mesma sessão, e vice-versa.

## Fase atual
**M0: Fundação** (meta: `v0.1.0`). Planejamento fechado com o usuário em 2026-10-06 (rodadas N, P, I, S e F, registradas nos docs e nos ADRs). Ordem das issues da M0:
1. Projeto Next (create-next-app, ESLint, Prettier, Vitest, Playwright, shadcn, `proxy.ts`).
2. Workflows e proteção da `main`.
3. Banco local (`compose.dev.yaml`, Drizzle, roles e teste de RLS).
4. Rodada V (identidade visual).
5. Deploy (Dockerfile, `deploy/`, staging, "Em breve" na produção).
6. VPS, DNS, Resend e OAuth Apps (o usuário faz, com o passo a passo).
7. Fechamento da M0 (`v0.1.0`).

Lembretes:
- Pendências em `docs/pendencias.md`. Regras ⏳ ainda não foram confirmadas pelo usuário.

Stack de ferramentas: Node 24 LTS, npm, Docker (`compose.dev.yaml` local; `deploy/compose.yaml` na VPS), Drizzle e `drizzle-kit`, GHCR.

## Como trabalhar com o usuário
- Siga a skill **`modo-de-trabalho`** (decisões, pt-BR, PRs, Linear, releases).
- O usuário quer **participar das decisões técnicas e aprender**. **Nenhuma decisão sozinho, nem as pequenas** (valores, limites, nomes, labels, textos, regras novas, configurações extras): explique o problema, as soluções com prós e contras e uma recomendação, e pergunte **antes** de escrever. Se algo foi decidido sem ele, aponte antes do merge.
- Decisão que ele não confirmou fica como **proposto** (⏳) nos docs e ADRs.
- Explicações de uma decisão vão **no chat**, num turno que termina com a pergunta em texto. Nada de explicação longa dentro do AskUserQuestion, nem texto antes dele no mesmo turno.
- Responda sempre em **pt-BR**.
- **Eu implemento, ele revisa:** um PR por issue, com explicação do que e por quê; merge (squash) só após o OK dele.

## Regras de trabalho (definidas pelo usuário)
1. **Sempre use as ferramentas Write e Edit para criar ou editar arquivos.** Nada de scripts Python, `sed`, `awk`, heredocs ou redirecionamento de shell para modificar arquivos: o usuário acompanha as mudanças pelos diffs. Exceção: geradores/CLIs oficiais (`create-next-app`, `shadcn add`, `drizzle-kit generate`, `npm install`) podem criar arquivos, e o Prettier pode reformatar; arquivos binários só com autorização do usuário; tudo é revisado no PR.
2. **Código sempre em inglês:** variáveis, funções, classes, tipos, arquivos de código, tabelas e colunas. Textos da UI, URLs e mensagens para o usuário final ficam em pt-BR.

## Regras inegociáveis
- **Simplicidade:** nada adiciona passo, campo obrigatório ou tela ao fluxo principal sem justificativa (`docs/01-visao.md`).
- **Segurança:** siga `docs/07-seguranca.md`:
  - RLS `ENABLE` + `FORCE` em toda tabela do produto, com teste;
  - o app nunca conecta como dona ou superusuário;
  - validação no servidor com Zod;
  - Markdown sem HTML bruto e sem imagens externas;
  - toda imagem refeita pelo sharp;
  - módulos de banco, auth, storage e e-mail com `server-only`.
- **Repo público:** nenhum segredo, dado real ou PII em código, docs, seeds, testes ou imagem Docker. Segredos do app só nos `.env` da VPS.
- Commits e **títulos de PR** em Conventional Commits, pt-BR, com o ID do Linear: viram o histórico da `main` e as notas das releases.
- Produção só recebe **versões criadas pelo usuário** (`gh release create vX.Y.Z --target main --generate-notes` → `production.yml`). O agente **nunca** publica tags ou releases; só cria um **rascunho** se o usuário pedir.
- Backup do banco da produção antes de cada release, a partir da primeira depois da `v1.0.0`.
- Regras numeradas (RN, RF, RNF, F, ADR) nunca são renumeradas.
