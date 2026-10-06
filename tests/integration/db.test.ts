import { sql } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

import { closeDb, getAppDb, getAuthDb, withUserDb } from "@/lib/db";

// Conexões e withUserDb contra o Postgres real (ADR-0003, docs/07-seguranca.md §3).

const USER_ID = "11111111-1111-4111-8111-111111111111";

async function currentUserId(
  db: Pick<ReturnType<typeof getAppDb>, "execute">,
): Promise<string | null> {
  const rows = await db.execute<{ id: string | null }>(sql`select app.current_user_id() as id`);
  return rows[0]?.id ?? null;
}

afterAll(async () => {
  await closeDb();
});

describe("connections", () => {
  it("connects the app as app_user and the login as app_auth", async () => {
    const [app] = await getAppDb().execute<{ role: string }>(sql`select current_user as role`);
    const [auth] = await getAuthDb().execute<{ role: string }>(sql`select current_user as role`);
    expect(app?.role).toBe("app_user");
    expect(auth?.role).toBe("app_auth");
  });
});

describe("withUserDb", () => {
  it("has no user outside a transaction (closed by default)", async () => {
    expect(await currentUserId(getAppDb())).toBeNull();
  });

  it("sets the user only inside its own transaction", async () => {
    const inside = await withUserDb(USER_ID, (tx) => currentUserId(tx));
    expect(inside).toBe(USER_ID);
    // A conexão volta ao pool sem usuário.
    expect(await currentUserId(getAppDb())).toBeNull();
  });

  it("rejects an id that is not a UUID", async () => {
    await expect(withUserDb("1 or 1=1", async () => null)).rejects.toThrow(/UUID/);
  });
});
