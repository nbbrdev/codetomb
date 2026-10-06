// Aplica as migrations pendentes com a role dona (codetomb_owner). ADR-0003.
// Local: `npm run db:migrate` (lê o .env.local). No CI: passo "Banco de teste - migrations". Na VPS:
// serviço `migrate` do compose (NBB-106).
import { existsSync } from "node:fs";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const url = process.env.DATABASE_URL_OWNER;
if (!url) {
  console.error("Defina DATABASE_URL_OWNER (veja .env.example).");
  process.exit(1);
}

const client = postgres(url, { max: 1, onnotice: () => {} });
try {
  await migrate(drizzle(client), { migrationsFolder: "db/migrations" });
  console.log("Migrations aplicadas.");
} finally {
  await client.end();
}
