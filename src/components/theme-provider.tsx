"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Tema claro/escuro (NBB-105 V7-A): padrão "Automático" (segue o sistema). O botão para fixar Claro
 * ou Escuro vem com o cabeçalho, na M1; a escolha fica salva no navegador (localStorage).
 * O `nonce` da CSP chega pelas props (src/app/layout.tsx) e libera o script inline anti-piscada.
 */
export function ThemeProvider(props: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    />
  );
}
