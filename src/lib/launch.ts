import { type AppEnv } from "@/lib/app-env";

// Página "Em breve" (ADR-0008, NBB-106 E3-A): até o lançamento (v1.0.0), a produção mostra só o
// "Em breve". Fechado por padrão: o site só abre com PUBLIC_LAUNCH=true no .env da produção, então um
// .env incompleto deixa o site fechado, nunca aberto sem querer. Local e staging nunca mostram.
export function isComingSoon(
  appEnv: AppEnv,
  publicLaunch: string | undefined = process.env.PUBLIC_LAUNCH,
): boolean {
  return appEnv === "production" && publicLaunch !== "true";
}
