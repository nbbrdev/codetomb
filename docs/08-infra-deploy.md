# 08 — Infra e deploy

> Status: decisões I1–I7 e F5 do usuário (2026-10-05 e 2026-10-06), a porta local 3010 (NBB-102 D3-A) e o deploy (NBB-106, E1–E7, 2026-10-10) · Última atualização: 2026-10-10
>
> Segue o modelo do Orçô. A base da VPS (SSH, firewall, Nginx, Certbot, usuário `deploy`) está no repositório privado `nbbrdev/vps`. Aqui fica só o que é do Codetomb. O passo a passo da VPS está em [`deploy/README.md`](../deploy/README.md).
>
> Nunca escreva o IP da VPS, senhas, chaves ou o conteúdo de `.env` neste repositório.

## Ambientes (I2-A)

| Ambiente | Onde | Dados | Quando atualiza |
|---|---|---|---|
| Local | `npm run dev` em `http://localhost:3010` (`APP_ENV=development`; NBB-102 D3-A) | `compose.dev.yaml`: Postgres, RustFS e Mailpit | — |
| **Staging** | `https://staging.codetomb.nbbrdev.com` (`APP_ENV=staging`) | Postgres próprio (RustFS a partir da M2), dados fictícios | merge na `main` com CI verde (`staging.yml`) |
| **Produção** | `https://codetomb.nbbrdev.com` (`APP_ENV=production`) | Postgres próprio (RustFS a partir da M2) | **release criada pelo usuário** (`production.yml`) |

- **Não há preview por PR.** O PR é revisado pelo código, pela explicação, pelo CI e rodando a branch localmente.
- **Até a `v1.0.0`, a produção mostra só "Em breve"** (F5-A, [ADR-0008](decisoes/0008-versionamento-releases-e-em-breve.md)): fechado por padrão, abre só com `PUBLIC_LAUNCH=true` no `.env` da produção (NBB-106 E3-A). Toda rota mostra o "Em breve", com `noindex` (E4-A).
- **Staging:** HTTP Basic Auth em **todas** as rotas, sem exceções por enquanto (NBB-106 E5-A), e `noindex`.
- **Versão no ar:** no rodapé das páginas (E6-A), vinda da `NEXT_PUBLIC_APP_VERSION` gravada no build: `staging-<commit curto>` ou `vX.Y.Z`.

## Na VPS ([ADR-0007](decisoes/0007-hospedagem-vps.md))

```
/opt/codetomb/
├── bin/deploy.sh        ← dono root; o usuário deploy só executa
├── staging/             ← dono deploy, chmod 700: .env, image.env, compose.yaml
└── production/          ← mesma estrutura
```

- Dois **projetos Compose** (`codetomb-staging` e `codetomb-production`), cada um com **rede e volumes próprios**. Nada do Codetomb alcança o Orçô, e o staging não alcança a produção.
- **Serviços (NBB-106 E2-A):** `app`, `migrate` (aplica as migrations com a role dona) e `db` (Postgres 17, versão fixa). O `rustfs` (versão fixa, **sem porta publicada**) entra na M2, com as imagens.
- **Imagem:** `ghcr.io/nbbrdev/codetomb`, **pública** (E7-A), construída pelo `Dockerfile` em etapas. Ela leva o app (Next standalone, usuário não-root), o migrator e os arquivos de deploy (`compose.yaml`, `init.sh`, `roles.sql`).
- **Portas, só em `127.0.0.1`** (I3-A):

  | Serviço | Produção | Staging |
  |---|---|---|
  | app | 3010 | 3011 |
  | db (para o backup por túnel SSH) | 5442 | 5443 |

- **Hardening do app:** usuário não-root, `read_only` com `tmpfs` em `/tmp`, `no-new-privileges`, `restart: unless-stopped`, logs limitados (10 MB × 3), só sobe depois do banco saudável, e recebe só as variáveis que usa.
- **Recursos:** o Codetomb soma um Postgres e um app por ambiente à KVM 2 (e um RustFS na M2). Antes do primeiro deploy, conferir a memória livre e o disco (`free -h`, `df -h`, `docker stats`).

## Nginx e DNS (I1-A)

- Site versionado em `deploy/nginx/codetomb.nbbrdev.com.conf`:
  - `codetomb.nbbrdev.com` → `127.0.0.1:3010`;
  - `staging.codetomb.nbbrdev.com` → `127.0.0.1:3011`.

  O Nginx repassa os headers `X-Forwarded-For`, `X-Forwarded-Proto` e `Host`, com `client_max_body_size 5m`.
- **Certbot:** `certbot --nginx -d codetomb.nbbrdev.com -d staging.codetomb.nbbrdev.com`, com renovação automática.
- **DNS na Hostinger** (zona `nbbrdev.com`): registros A `codetomb` e `staging.codetomb` → IP da VPS.

## Deploy

1. **Merge na `main`** → CI verde → `staging.yml` chama a receita comum `deploy-vps.yml`.
2. A receita constrói a imagem (`ghcr.io/nbbrdev/codetomb:staging-<commit>`), envia ao **GHCR** e conecta por SSH com a chave do ambiente, mandando só `<tag>@sha256:<digest>`.
3. Na VPS, a chave está presa ao comando `/opt/codetomb/bin/deploy.sh <ambiente>` no `authorized_keys` do usuário `deploy`.
4. O `deploy.sh` aceita só `staging-<commit>` no staging e `vX.Y.Z` na produção, sempre com o digest. Ele baixa a imagem, copia o `compose.yaml` de dentro dela, grava o `image.env`, roda as migrations e faz o `up -d`.
5. **Produção:** o mesmo caminho, a partir de uma **release do usuário** (`production.yml`: verify → build → deploy).

- **Rollback de código:** "Re-run all jobs" na execução anterior do workflow. Migrations não voltam.
- O `deploy.sh` é instalado à mão e **não se atualiza sozinho**: mudou no repositório, reinstalar na VPS.

## Segredos

- Do app: só em `/opt/codetomb/<ambiente>/.env` (`chmod 600`). Lista em `deploy/env.example`.
- Do GitHub, por environment (`staging` só para a `main`; `production` só para as tags `v*`): `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` e `VPS_KNOWN_HOSTS`.
- Um PR que exige variável nova na VPS leva o aviso **"⚠️ Antes do merge (na VPS)"**.

## E-mail (I5-A, [ADR-0006](decisoes/0006-email-smtp.md))

- **Resend**, com o domínio de envio `codetomb.nbbrdev.com` verificado na Hostinger (SPF, DKIM; o DMARC vem do domínio raiz).
- Remetente: `Codetomb <nao-responda@codetomb.nbbrdev.com>`.
- Uma API key por ambiente, só com permissão de envio e só para esse domínio.
- No local: Mailpit.

## GitHub OAuth (I7-A)

Três OAuth Apps, criadas pelo usuário em github.com → Settings → Developer settings:

| App | Homepage | Endereço de retorno |
|---|---|---|
| `Codetomb (dev)` | `http://localhost:3010` | `http://localhost:3010/api/auth/callback/github` |
| `Codetomb (staging)` | `https://staging.codetomb.nbbrdev.com` | `https://staging.codetomb.nbbrdev.com/api/auth/callback/github` |
| `Codetomb` | `https://codetomb.nbbrdev.com` | `https://codetomb.nbbrdev.com/api/auth/callback/github` |

## Backup (I6-A)

- Manual, pelo DBeaver, por túnel SSH até a porta local do banco (5442 na produção), com o superusuário, no formato Custom.
- **Antes do backup, conferir no cabeçalho da tela que a conexão é a da produção.**
- Obrigatório antes de cada release a partir da primeira depois da `v1.0.0`. As imagens do RustFS ficam fora (o backup delas está no Backlog, I6-B).

## Operação (na VPS)

Comandos e atalho em [`deploy/README.md`](../deploy/README.md), seção "Operação" (ver o que está rodando, logs, reiniciar, recriar o app depois de mudar o `.env`, versão no ar, disco).
