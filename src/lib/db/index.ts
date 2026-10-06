import "server-only";

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/db/schema";

// Acesso ao banco (ADR-0003, docs/07-seguranca.md §3). Duas conexões, cada uma com sua role:
//   - app_user: tabelas do produto, sempre filtradas pela RLS. Para dados de um usuário, use SEMPRE
//     withUserDb; a leitura pública (visitante) usa getAppDb() sem usuário, e a RLS só libera o que
//     é público.
//   - app_auth: só as tabelas de login (Better Auth, M1).
// O app nunca conecta como codetomb_owner (dona) nem como superusuário.

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Defina ${name} (veja .env.example).`);
  }
  return value;
}

function connect(url: string) {
  return drizzle(postgres(url, { max: 10 }), { schema });
}

type Database = ReturnType<typeof connect>;
export type UserTransaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

// Uma conexão por processo. No `npm run dev`, o recarregamento de módulos criaria conexões novas a
// cada edição; guardá-las no globalThis evita isso.
const globalForDb = globalThis as unknown as {
  codetombAppDb?: Database;
  codetombAuthDb?: Database;
};

export function getAppDb(): Database {
  globalForDb.codetombAppDb ??= connect(requireEnv("DATABASE_URL_APP"));
  return globalForDb.codetombAppDb;
}

export function getAuthDb(): Database {
  globalForDb.codetombAuthDb ??= connect(requireEnv("DATABASE_URL_AUTH"));
  return globalForDb.codetombAuthDb;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Roda `fn` numa transação da role app_user em nome de `userId`: as policies de RLS só deixam
 * alterar as linhas desse usuário. O `userId` deve vir da sessão validada no servidor, nunca do
 * navegador.
 *
 * `set_config(..., true)` vale só dentro desta transação: quando ela termina, a conexão volta ao
 * pool sem usuário.
 */
export async function withUserDb<T>(
  userId: string,
  fn: (tx: UserTransaction) => Promise<T>,
): Promise<T> {
  if (!UUID.test(userId)) {
    throw new Error("withUserDb: userId precisa ser um UUID.");
  }
  return getAppDb().transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.user_id', ${userId}, true)`);
    return fn(tx);
  });
}

/** Fecha as conexões (testes e scripts). */
export async function closeDb(): Promise<void> {
  await Promise.all([
    globalForDb.codetombAppDb?.$client.end(),
    globalForDb.codetombAuthDb?.$client.end(),
  ]);
  globalForDb.codetombAppDb = undefined;
  globalForDb.codetombAuthDb = undefined;
}
