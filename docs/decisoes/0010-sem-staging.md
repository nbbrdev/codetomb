# ADR-0010 — Sem ambiente de staging: só produção por release, preview local

- **Status:** aceito (decidido pelo usuário em 2026-10-21; detalhes R1-A a R5-A na NBB-121)
- **Data:** 2026-10-21
- **Substitui:** o I2-A (três ambientes: local, staging e produção) e as partes de staging do [ADR-0007](0007-hospedagem-vps.md), do [ADR-0008](0008-versionamento-releases-e-em-breve.md) e da NBB-106 (E5-A, o Basic Auth).

## Contexto
O planejamento (I2-A) seguiu o Orçô: um staging atualizado a cada merge na `main`, protegido por senha, e a produção por release. A NBB-106 chegou a implementar o staging. Antes de a VPS ser configurada (NBB-107), o usuário decidiu que, **deste projeto em diante**, não haverá staging: o caminho até a VPS é só o release de produção por tag, e o teste é feito localmente.

## Decisão
- **Dois ambientes:** o local (`APP_ENV=development`) e a produção (`APP_ENV=production`). O valor `staging` deixa de existir: um `.env` antigo com ele faz o app falhar ao subir.
- **Merge na `main` não publica nada:** só roda o CI. A produção só recebe **releases** (`gh release create vX.Y.Z`), pelo `production.yml`, que agora faz tudo num arquivo só: verificação, build da imagem e deploy (R2-A).
- **Preview local (R4-A):** `npm run dev` no dia a dia; antes de um release, `npm run build && npm run start`, que roda o app compilado como na produção.
- **O CI constrói a imagem Docker** em todo PR, sem enviar (R3-A). Sem staging, é o que garante que um `Dockerfile` quebrado não chegue à `main` e só apareça no release.
- **Sem Basic Auth (R1-A):** o código do staging (`basic-auth.ts`, testes, ramo do proxy) foi removido. Se um dia o staging voltar, ele está no histórico do Git e no Orçô.
- **Na VPS:** só `/opt/codetomb/production`, a porta 3010 (app) e a 5442 (banco), o site `codetomb.nbbrdev.com` e uma chave de deploy.
- O **"Em breve"** continua (E3-A): a produção fica fechada até a `v1.0.0`.

## Alternativas descartadas
- Manter o staging (I2-A): mais um ambiente para configurar, manter e pagar em memória, num projeto pequeno de uma pessoa só.
- Deixar o código do Basic Auth parado (R1-B): código sem uso, ainda assim mantido e testado.

## Consequências
- O produto só é visto no computador de quem desenvolve até o lançamento (`v1.0.0`). As releases `v0.x` continuam indo para a produção, atrás do "Em breve", para testar o caminho.
- Uma release é o primeiro contato da versão com a VPS: por isso o CI constrói a imagem, e os testes (unidade, integração e E2E) continuam obrigatórios em todo PR.
- O backup antes do release (a partir da primeira depois da `v1.0.0`) ganha ainda mais peso, porque não há um ensaio do deploy antes.
- A skill `modo-de-trabalho` foi atualizada (R5-A): projetos novos começam sem staging.
