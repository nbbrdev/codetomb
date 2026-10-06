import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { connection } from "next/server";

import { cn } from "@/lib/utils";
import "./globals.css";

// Fonte provisória (padrão do shadcn), até a rodada V definir a identidade visual (NBB-105).
// O next/font baixa a fonte no build e a serve do próprio app: nada é carregado do Google no navegador.
const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Codetomb",
  description: "O cemitério de projetos dos desenvolvedores.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // A CSP usa um nonce novo a cada requisição (src/proxy.ts), e o Next só o aplica aos scripts
  // em páginas renderizadas a cada requisição: connection() garante isso (docs/07-seguranca.md §7).
  await connection();

  return (
    <html lang="pt-BR" className={cn("h-full font-sans", geist.variable)}>
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  );
}
