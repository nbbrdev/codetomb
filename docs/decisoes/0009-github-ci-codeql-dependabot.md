# ADR-0009 — Repositório público com CI, CodeQL e Dependabot

- **Status:** aceito (decidido pelo usuário em 2026-10-06: F1-A, F7-A)
- **Data:** 2026-10-06

## Contexto
O repositório serve de portfólio, e o fluxo de trabalho (um PR por issue, revisão do usuário, merge por squash) já funciona no Orçô.

## Decisão
- Repositório **`nbbrdev/codetomb`, público**, **sem licença** por enquanto (todos os direitos reservados).
- **Proteção da `main`:**
  - PR obrigatório, inclusive para administradores;
  - checks `ci`, `codeql` e `pr-title` obrigatórios;
  - branch em dia com a `main`;
  - histórico linear e conversas resolvidas;
  - sem force push nem exclusão;
  - merge só por squash, com a branch apagada depois.
- **Workflows:** `ci.yml` (Prettier, lint, tipos, testes de unidade e integração com Postgres e RustFS reais, build, E2E, `npm audit`), `codeql.yml`, `pr-title.yml`, `deploy-vps.yml`, `staging.yml` e `production.yml`.
- **Dependabot**, **secret scanning com push protection** e `CODEOWNERS`.

## Alternativas descartadas
- Repositório privado (F1-B): perde o portfólio, e a regra de "nenhum segredo no repositório" vale de qualquer forma.
- Licença MIT ou AGPL (F7-B, F7-C): dá para escolher depois. Uma licença aberta, depois de concedida, não pode ser desfeita.

## Consequências
- Nada de segredo, dado real ou dado pessoal no repositório, em nenhum arquivo.
