import postgres from "postgres";
import { afterAll, describe, expect, it } from "vitest";

// Invariantes de segurança do banco (docs/07-seguranca.md §3), conferidos contra o Postgres real a
// cada rodada do CI. Uma migration nova que esqueça a RLS, crie uma função sem `search_path` fixo ou
// dê ao app uma permissão a mais faz este teste falhar; a mudança precisa vir junto com a atualização
// das listas abaixo, para ser revisada no PR.

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Defina ${name} para os testes de integração (veja .env.example).`);
  return value;
}

const owner = postgres(requireEnv("DATABASE_URL_OWNER"), { max: 1, onnotice: () => {} });

afterAll(async () => {
  await owner.end();
});

/** O que a app_user pode fazer em cada tabela. Cresce a partir da M1 (`profiles`). */
const APP_USER_TABLES: Record<string, string[]> = {};

/** As funções do schema `app` que a app_user executa. */
const APP_USER_FUNCTIONS = ["current_user_id"];

describe("RLS (docs/07 §3)", () => {
  it("toda tabela do produto tem RLS ligada e forçada, com ao menos uma policy", async () => {
    const tables = await owner<
      { name: string; enabled: boolean; forced: boolean; policies: number }[]
    >`
      select c.relname as name, c.relrowsecurity as enabled, c.relforcerowsecurity as forced,
             (select count(*)::int from pg_policies p
               where p.schemaname = 'public' and p.tablename = c.relname) as policies
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind = 'r'
       order by 1`;
    // Ainda sem tabelas (a primeira vem na M1); a regra passa a valer sozinha para cada tabela nova.
    for (const table of tables) {
      expect(table, table.name).toMatchObject({ enabled: true, forced: true });
      expect(table.policies, table.name).toBeGreaterThan(0);
    }
  });
});

describe("funções (docs/05)", () => {
  it("todas as do schema `app` são da codetomb_owner e fixam o search_path vazio", async () => {
    const functions = await owner<{ name: string; owner: string; config: string[] | null }[]>`
      select p.proname as name, pg_get_userbyid(p.proowner) as owner, p.proconfig as config
        from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'app'`;
    expect(functions.length).toBeGreaterThan(0);
    for (const fn of functions) {
      expect(fn.owner, fn.name).toBe("codetomb_owner");
      expect(fn.config ?? [], fn.name).toContain('search_path=""');
    }
  });

  it("nenhuma função dos schemas do app pode ser executada por PUBLIC", async () => {
    const open = await owner<{ name: string }[]>`
      select n.nspname || '.' || p.proname as name
        from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
       where n.nspname in ('app', 'public', 'auth')
         and exists (
           select 1 from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
            where a.grantee = 0 and a.privilege_type = 'EXECUTE'
         )`;
    expect(open.map((row) => row.name)).toEqual([]);
  });

  it("a app_user executa exatamente as funções esperadas", async () => {
    const rows = await owner<{ name: string }[]>`
      select p.proname as name
        from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'app' and has_function_privilege('app_user', p.oid, 'EXECUTE')
       order by 1`;
    expect(rows.map((row) => row.name)).toEqual(APP_USER_FUNCTIONS);
  });
});

describe("permissões das roles do app (docs/07 §3, ADR-0003)", () => {
  it("nenhuma role do app é superusuária, ignora a RLS ou cria roles e bancos", async () => {
    const roles = await owner<Record<string, boolean | string>[]>`
      select rolname, rolsuper, rolbypassrls, rolcreaterole, rolcreatedb
        from pg_roles where rolname in ('app_user', 'app_auth') order by 1`;
    const safe = { rolsuper: false, rolbypassrls: false, rolcreaterole: false, rolcreatedb: false };
    expect(roles).toEqual([
      { rolname: "app_auth", ...safe },
      { rolname: "app_user", ...safe },
    ]);
  });

  it("as roles do app não criam nada em nenhum schema", async () => {
    const rows = await owner<{ schema: string; appUser: boolean; appAuth: boolean }[]>`
      select nspname as schema,
             has_schema_privilege('app_user', oid, 'CREATE') as "appUser",
             has_schema_privilege('app_auth', oid, 'CREATE') as "appAuth"
        from pg_namespace where nspname in ('public', 'app', 'auth')`;
    expect(rows).toHaveLength(3);
    for (const row of rows) {
      expect(row, row.schema).toMatchObject({ appUser: false, appAuth: false });
    }
  });

  it("o banco e o schema public pertencem à codetomb_owner", async () => {
    const [row] = await owner<{ database: string; schema: string }[]>`
      select pg_get_userbyid(d.datdba) as database,
             (select pg_get_userbyid(nspowner) from pg_namespace where nspname = 'public') as schema
        from pg_database d where d.datname = current_database()`;
    // No Postgres 15+, o dono do public é pg_database_owner, que é a dona do banco.
    expect(row).toEqual({ database: "codetomb_owner", schema: "pg_database_owner" });
  });

  it("a app_user tem nas tabelas exatamente as permissões esperadas, e nada no schema auth", async () => {
    const rows = await owner<{ name: string; privileges: string[] }[]>`
      select table_schema || '.' || table_name as name,
             array_agg(privilege_type::text order by privilege_type) as privileges
        from information_schema.role_table_grants
       where grantee = 'app_user'
       group by table_schema, table_name
       order by 1`;
    expect(Object.fromEntries(rows.map((row) => [row.name, row.privileges]))).toEqual(
      APP_USER_TABLES,
    );
  });

  it("a app_auth só alcança tabelas do schema auth", async () => {
    const rows = await owner<{ schema: string }[]>`
      select distinct table_schema as schema
        from information_schema.role_table_grants where grantee = 'app_auth'`;
    for (const row of rows) {
      expect(row.schema).toBe("auth");
    }
  });
});
