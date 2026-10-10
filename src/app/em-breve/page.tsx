import { AppVersion } from "@/components/app-version";

// Página "Em breve" (ADR-0008, NBB-106 E4-A): na produção, até o lançamento (v1.0.0), o proxy mostra
// esta página em toda rota (src/proxy.ts), com noindex.
export default function ComingSoonPage() {
  return (
    <>
      <main className="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">🪦 Codetomb</h1>
        <p className="text-muted-foreground">
          O cemitério de projetos dos desenvolvedores abre em breve. Ainda estamos cavando.
        </p>
      </main>
      <AppVersion />
    </>
  );
}
