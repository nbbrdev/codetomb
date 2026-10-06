# 05 — Modelo de dados

> Status: ⏳ esboço. As colunas de cada tabela são decididas e detalhadas na fase em que a tabela nasce · Última atualização: 2026-10-06
>
> Nomes em inglês. Toda mudança de schema acontece no Drizzle (`src/lib/db/`), gera uma migration SQL em `db/migrations/` (revisada no PR) e atualiza este documento ([ADR-0003](decisoes/0003-banco-drizzle-rls-roles.md)).

## Roles e schemas

| Schema | Conteúdo | Quem acessa |
|---|---|---|
| `auth` | tabelas do **Better Auth**: `user`, `account` (GitHub e senha), `session`, `verification` | só a role **`app_auth`** |
| `public` | tabelas do produto | só a role **`app_user`**, sempre com RLS |
| `app` | funções auxiliares (ex.: `app.current_user_id()`, `app.is_admin()`) | `app_user` (execute) |

- A role **`codetomb_owner`** é dona de tudo e só é usada pelas migrations (nomes confirmados na NBB-104 B2-A).
- `app_user` e `app_auth` não têm `BYPASSRLS` nem permissão para mudar o schema.
- **Base de segurança (NBB-104, migration `0000_base_security`):**
  - `public` e `auth` fechados para `PUBLIC`; `app_user` só usa `public` e `app`, e `app_auth` só usa `auth`;
  - **permissões automáticas:** toda tabela que a `codetomb_owner` criar em `public` já nasce com `SELECT`, `INSERT`, `UPDATE` e `DELETE` para a `app_user` (e, em `auth`, para a `app_auth`). Sem RLS e policies, a `app_user` continua sem ver nada, porque as tabelas usam `FORCE ROW LEVEL SECURITY`;
  - nenhuma função é executável por padrão: cada uma concede `EXECUTE` só à role que precisa;
  - `app.current_user_id()`: o usuário da transação, ou `NULL` fora do `withUserDb`.
- Os **invariantes** (roles sem superusuário nem `BYPASSRLS`, funções da dona com `search_path` vazio, nenhuma função para `PUBLIC`, toda tabela com RLS forçada e policy, as permissões exatas da `app_user`) são conferidos a cada CI em `tests/integration/security-invariants.test.ts`.

## Convenções

- PK `id uuid default gen_random_uuid()`. Exceção: `profiles.id` = `auth.user.id`.
- Tabelas com dono têm `user_id uuid references auth.user(id)`. Em geral com `on delete cascade`, exceto nos comentários (RN-07: o comentário fica, com o autor nulo).
- Nas policies, o usuário da requisição é `app.current_user_id()`, lido de `current_setting('app.user_id', true)`, definido por `withUserDb` na transação.
- `created_at` / `updated_at timestamptz not null default now()`, com o `updated_at` mantido por trigger.
- Textos livres com limite de tamanho por `check (char_length(x) <= N)` (RN-08, RN-17, RN-25).
- **RLS habilitada e forçada (`FORCE`) em todas as tabelas do produto.** Sem policy, não há acesso.

## Tabelas previstas

| Tabela | Fase | O que guarda | RLS (resumo) |
|---|---|---|---|
| `profiles` | M1 | nome, @usuário (único), bio, link do GitHub, avatar, `role` (`user` ou `admin`), `blocked_at` | leitura pública (exceto bloqueados); o dono altera só as colunas editáveis; `role` e `blocked_at` só pelo admin |
| `projects` | M2 | nome, descrição, motivo, link do repositório, estado (`life_support`, `abandoned`, `seeking_team`, `revived`), `removed_at` | leitura pública do que não foi removido; escrita só do autor; o admin remove |
| `tags` / `project_tags` | M2 | tags de tecnologia normalizadas (minúsculas) | leitura pública; escrita junto com o projeto |
| `images` | M2 | chave no RustFS, miniatura, ordem, dono (projeto, atualização ou avatar) | segue o conteúdo dono |
| `project_updates` | M3 | texto em Markdown, `removed_at` | leitura pública; escrita só do autor do projeto |
| `comments` | M3 | texto, `parent_id` (1 nível, RN-22), `edited_at`, `deleted_at`, `removed_at` | leitura pública; o autor edita e exclui os próprios |
| `reactions` | M3 | tipo (enum), alvo, usuário; única por (usuário, alvo, tipo) | leitura pública; o usuário cria e apaga as próprias |
| `notifications` | M5 | destinatário, tipo, referência, `read_at` | só o destinatário lê e marca como lida; criadas por função do banco |
| `reports` | M5 | quem denunciou, alvo, motivo, detalhes, decisão do admin | quem denunciou cria; só o admin lê e decide |
| `rate_limits` | M1 | janelas dos limites de uso (RN-38, RN-39) | acesso só por função `SECURITY DEFINER` |

## Arquivos (RustFS)

- Um bucket por ambiente (nome a decidir na M2), com chaves `{uuid}.webp` e `{uuid}-thumb.webp`, **sem o id do usuário** no nome.
- O RustFS não participa da cascata do banco. Excluir um projeto, uma atualização, um avatar ou uma conta apaga os arquivos de forma explícita, depois do commit.
