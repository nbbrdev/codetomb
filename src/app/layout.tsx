import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";

import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import "./globals.css";

// Fontes (NBB-105 V3-B): Fraunces nos títulos, Geist no texto e Geist Mono no código. O next/font
// baixa as fontes no build e as serve do próprio app: nada é carregado do Google no navegador.
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});
// Fonte variável: um arquivo só cobre todos os pesos.
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });

export const metadata: Metadata = {
  title: "Codetomb",
  description: "O cemitério de projetos dos desenvolvedores.",
  // Favicon provisório (V5-A): src/app/icon.svg. Declarado aqui também: com `icons` na metadata, o
  // Next deixa de anunciar o icon.svg sozinho (lição do Orçô).
  icons: { icon: { url: "/icon.svg", type: "image/svg+xml" } },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#10130f" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Nonce da CSP desta requisição (gerado no src/proxy.ts): libera o script inline do next-themes.
  // Ler headers() também torna as páginas dinâmicas, o que o nonce exige (docs/07-seguranca.md §7).
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    // suppressHydrationWarning: o next-themes adiciona a classe do tema no <html> antes da hidratação.
    <html
      lang="pt-BR"
      className={cn("h-full", geist.variable, geistMono.variable, fraunces.variable)}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider nonce={nonce}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
