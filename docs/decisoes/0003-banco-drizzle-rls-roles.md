# ADR-0003 — PostgreSQL com Drizzle, RLS e roles separadas

- **Status:** aceito (decidido pelo usuário em 2026-10-05 e 2026-10-06: P2-A, S1-A, S7-A)
- **Data:** 2026-10-06

## Contexto
Numa rede social, o pior bug possível é alguém editar ou apagar o conteúdo de outra pessoa. Ao mesmo tempo, quase tudo é público para leitura (N10-A). O Orçô já usa um modelo de RLS com roles separadas que o usuário conhece.

## Decisão
- **PostgreSQL 17**, um por ambiente, e **Drizzle** com migrations SQL geradas pelo `drizzle-kit` e revisadas no PR.
- **Três roles:**

  | Role | Quem usa | Pode |
  |---|---|---|
  | `codetomb_owner` | só as migrations | é dona das tabelas e funções |
  | `app_auth` | o Better Auth | só as tabelas de login |
  | `app_user` | o resto do app | só as tabelas do produto, sempre com RLS |

- **RLS habilitada e forçada** em todas as tabelas do produto:
  - a **leitura pública** é liberada por policy;
  - a **escrita** só é permitida ao dono (`app.current_user_id()`);
  - o **admin** modera por policies que chamam `app.is_admin()`.
- **Admin** = `profiles.role = 'admin'`, alterado por um comando SQL documentado (S7-A).
- O acesso logado passa por `withUserDb(userId, fn)`, reaproveitado do Orçô.

## Alternativas descartadas
- Prisma (P2-B): esconde mais o SQL, e o usuário já conhece o Drizzle.
- Checagem de dono só no código do app (S1-B): sem a "segunda tranca" do banco.
- Admin por variável de ambiente (S7-B): a RLS não consegue checar.

## Consequências
- Toda tabela nova exige policies, grants e teste de RLS no mesmo PR.
- As consultas públicas precisam respeitar as policies de "removido" e "bloqueado". Os testes de integração conferem isso.
