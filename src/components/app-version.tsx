// Versão no ar (NBB-106 E6-A): `vX.Y.Z` na produção, `staging-<commit>` no staging e `dev` no local.
// Vem da NEXT_PUBLIC_APP_VERSION, gravada no build da imagem (Dockerfile, deploy-vps.yml).
export function AppVersion() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";
  return (
    <footer className="p-4 text-center font-mono text-xs text-muted-foreground">{version}</footer>
  );
}
