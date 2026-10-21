# 08 — Infra e deploy

> Status: decisões I1–I7 e F5 do usuário (2026-10-05 e 2026-10-06), a porta local 3010 (NBB-102 D3-A), o deploy (NBB-106, E1–E7, 2026-10-10) e **sem staging** (ADR-0010, NBB-121, 2026-10-21) · Última atualização: 2026-10-21
>
> Segue o modelo do Orçô, sem o staging. A base da VPS (SSH, firewall, Nginx, Certbot, usuário `deploy`) está no repositório privado `nbbrdev/vps`. Aqui fica só o que é do Codetomb. O passo a passo da VPS está em [`deploy/README.md`](../deploy/README.md).
>
> Nunca escreva o IP da VPS, senhas, chaves ou o conteúdo de `.env` neste repositório.

## Ambientes

| Ambiente | Onde | Dados | Quando atualiza |
|---|---|---|---|
| Local | `npm run dev` em `http://localhost:3010` (`APP_ENV=development`; NBB-102 D3-A) | `compose.dev.yaml`: Postgres, RustFS e Mailpit | — |
| **Produção** | `https://codetomb.nbbrdev.com` (`APP_ENV=production`) | Postgres próprio (RustFS a partir da M2) | **release criada pelo usuário** (`production.yml`) |

- **Não há staging** ([ADR-0010](decisoes/0010-sem-staging.md)), nem preview por PR. Um merge na `main` só roda o CI. O PR é revisado pelo código, pela explicação, pelo CI (que também constrói a imagem Docker) e rodando a branch localmente; antes de um release, o preview local é o `npm run build && npm run start` (`docs/06` §7).
- **Até a `v1.0.0`, a produção mostra só "Em breve"** (F5-A, [ADR-0008](decisoes/0008-versionamento-releases-e-em-breve.md)): fechado por padrão, abre só com `PUBLIC_LAUNCH=true` no `.env` da produção (NBB-106 E3-A). Toda rota mostra o "Em breve", com `noindex` (E4-A).
- **Versão no ar:** no rodapé das páginas (E6-A), vinda da `NEXT_PUBLIC_APP_VERSION` gravada no build: `vX.Y.Z`.

## Na VPS ([ADR-0007](decisoes/0007-hospedagem-vps.md))

```
/opt/codetomb/
├── bin/deploy.sh        ← dono root; o usuário deploy só executa
└── production/          ← dono deploy, chmod 700: .env, image.env, compose.yaml
```

- Um **projeto Compose** (`codetomb-production`), com **rede e volumes próprios**. Nada do Codetomb alcança o Orçô.
- **Serviços (NBB-106 E2-A):** `app`, `migrate` (aplica as migrations com a role dona) e `db` (Postgres 17, versão fixa). O `rustfs` (versão fixa, **sem porta publicada**) entra na M2, com as imagens.
- **Imagem:** `ghcr.io/nbbrdev/codetomb`, **pública** (E7-A), construída pelo `Dockerfile` em etapas. Ela leva o app (Next standalone, usuário não-root), o migrator e os arquivos de deploy (`compose.yaml`, `init.sh`, `roles.sql`).
- **Portas, só em `127.0.0.1`** (I3-A): app **3010** e banco **5442** (para o backup por túnel SSH).
- **Hardening do app:** usuário não-root, `read_only` com `tmpfs` em `/tmp`, `no-new-privileges`, `restart: unless-stopped`, logs limitados (10 MB × 3), só sobe depois do banco saudável, e recebe só as variáveis que usa.
- **Recursos:** conferidos em 2026-10-21 (NBB-107): 7,7 GiB de memória, com 6,8 disponíveis; os containers do Orçô somam ~485 MiB, e o Codetomb deve somar ~150 MiB (mais um RustFS na M2). 92 GB livres em disco.

## Nginx e DNS (I1-A)

- Site versionado em `deploy/nginx/codetomb.nbbrdev.com.conf`: `codetomb.nbbrdev.com` → `127.0.0.1:3010`. O Nginx repassa os headers `X-Forwarded-For`, `X-Forwarded-Proto` e `Host`, com `client_max_body_size 5m`.
- **Certbot:** `certbot --nginx -d codetomb.nbbrdev.com`, com renovação automática.
- **DNS na Hostinger** (zona `nbbrdev.com`): registro A `codetomb` → IP da VPS.

## Deploy

1. O usuário cria uma **release** (`gh release create vX.Y.Z --target main --generate-notes`).
2. O `production.yml` confere a tag (formato `vX.Y.Z`, commit na `main`, CI verde), constrói a imagem `ghcr.io/nbbrdev/codetomb:vX.Y.Z` e envia ao **GHCR**.
3. Ele conecta por SSH com a chave da produção, mandando só `vX.Y.Z@sha256:<digest>`. Na VPS, a chave está presa ao comando `/opt/codetomb/bin/deploy.sh production` no `authorized_keys` do usuário `deploy`.
4. O `deploy.sh` aceita só `vX.Y.Z` com o digest. Ele baixa a imagem, copia o `compose.yaml` de dentro dela, grava o `image.env`, roda as migrations e faz o `up -d`.

- **Rollback de código:** "Re-run all jobs" na execução do `production.yml` de uma versão anterior. Migrations não voltam.
- O `deploy.sh` é instalado à mão e **não se atualiza sozinho**: mudou no repositório, reinstalar na VPS.

## Segredos

- Do app: só em `/opt/codetomb/production/.env` (`chmod 600`). Lista em `deploy/env.example`.
- Do GitHub, no environment `production` (só tags `v*`): `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` e `VPS_KNOWN_HOSTS`.
- Um PR que exige variável nova na VPS leva o aviso **"⚠️ Antes do merge (na VPS)"**.

## E-mail (I5-A, [ADR-0006](decisoes/0006-email-smtp.md))

- **Resend**, com o domínio de envio `codetomb.nbbrdev.com` verificado na Hostinger (SPF, DKIM; o DMARC vem do domínio raiz). Configurado na M1 (NBB-118).
- Remetente: `Codetomb <nao-responda@codetomb.nbbrdev.com>`.
- Uma API key da produção, só com permissão de envio e só para esse domínio.
- No local: Mailpit.

## GitHub OAuth (I7-A)

Duas OAuth Apps, criadas pelo usuário em github.com → Settings → Developer settings, na M1 (NBB-119). Eram três; a de staging saiu com o ADR-0010.

| App | Homepage | Endereço de retorno |
|---|---|---|
| `Codetomb (dev)` | `http://localhost:3010` | `http://localhost:3010/api/auth/callback/github` |
| `Codetomb` | `https://codetomb.nbbrdev.com` | `https://codetomb.nbbrdev.com/api/auth/callback/github` |

## Backup (I6-A)

- Manual, pelo DBeaver, por túnel SSH até a porta local do banco (5442), com o superusuário, no formato Custom.
- **Antes do backup, conferir no cabeçalho da tela que a conexão é a da produção.**
- Obrigatório antes de cada release a partir da primeira depois da `v1.0.0`. As imagens do RustFS ficam fora (o backup delas está no Backlog, I6-B).

## Operação (na VPS)

Comandos e atalho em [`deploy/README.md`](../deploy/README.md), seção "Operação" (ver o que está rodando, logs, reiniciar, recriar o app depois de mudar o `.env`, versão no ar, disco).
