# 12 — Identidade visual

> Status: **✅ decidido pelo usuário em 2026-10-06** (NBB-105, rodada V: V1-A a V7-A) · Última atualização: 2026-10-06
>
> Prévia usada na decisão: [Codetomb · Rodada V](https://claude.ai/artifact/LC2BpCUg8kJhBL8oL1XB5r) (privada). Os tokens ficam em `src/app/globals.css`.

## Personalidade

**Cemitério com humor (N9-A), com respeito.** O visual é calmo, de pedra e musgo, e a graça fica nos detalhes: os estados com emoji, os textos das bordas, a lápide com `</>`. O musgo é a ideia central: ele cresce na lápide, e o verde é cor de vida, ligando o "abandonado" ao "revivido".

## Ícone (provisório, V5-A)

Uma lápide com `</>` gravado, na cor primária do tema claro, em `src/app/icon.svg` (favicon em SVG, declarado também na metadata do `layout.tsx`). O logo definitivo, os ícones de outros tamanhos e a imagem de compartilhamento ficam para a M6.

## Cores (V1-A: Musgo)

### Marca e neutros

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `primary` | `#3F6B2E` | `#9BC77A` | botões principais, links, foco |
| `primary-hover` | `#335824` | `#B2D695` | hover/pressionado |
| `secondary` / `accent` | `#E8F0E1` | `#1E2A18` | fundos suaves, seleção, chips |
| `primary-foreground` | `#FFFFFF` | `#132010` | texto sobre a primária |
| `background` | `#F5F6F2` | `#10130F` | fundo da página (pedra) |
| `card` / `popover` | `#FFFFFF` | `#171B15` | cartões, campos, painéis |
| `foreground` | `#1B2117` | `#E6EAE1` | texto principal |
| `muted-foreground` | `#5A6455` | `#9AA392` | texto secundário |
| `muted` | `#ECEEE8` | `#1F251C` | áreas neutras |
| `border` / `input` | `#DCE0D6` | `#2A3026` | bordas e divisores |
| `destructive` | `#B91C1C` | `#F87171` | ações sem volta e erros |

Os neutros puxam levemente para o verde, em vez de cinza puro.

### Estados do projeto (V2-A, RN-11)

| Estado | Texto / fundo (claro) | Texto / fundo (escuro) | Token |
|---|---|---|---|
| 🫁 Respirando por aparelhos | `#B45309` / `#FEF3C7` | `#FBBF24` / `#2E2410` | `state-life-support` |
| 🪦 Abandonado | `#52525B` / `#EEEEF0` | `#A1A1AA` / `#232327` | `state-abandoned` |
| 🔎 Procurando equipe | `#1D4ED8` / `#DBEAFE` | `#93C5FD` / `#13223F` | `state-seeking-team` |
| 🧟 Revivido | `#15803D` / `#DCFCE7` | `#4ADE80` / `#0F2A1A` | `state-revived` |

**Regra:** estado **sempre com emoji e nome**, nunca só a cor (acessibilidade). O verde do 🧟 Revivido é mais vivo que o musgo da marca, e o emoji desfaz qualquer dúvida.

### Contraste (WCAG AA, conferido em 2026-10-06)

Todos os pares de texto passam de 4,5:1. Os menores: estado 🫁 no claro (4,51:1) e 🧟 no claro (4,57:1). Texto principal: 15,2:1 (claro) e 15,4:1 (escuro). Primária sobre o branco: 6,3:1; texto do botão no escuro: 8,7:1. Cor nova entra nesta tabela com o contraste conferido.

## Tipografia (V3-B)

- **Fraunces** (serifada, variável) nos títulos (`h1` a `h3`, utilitário `font-heading`), com `text-wrap: balance`. Dá o ar de inscrição de lápide; fica só nos títulos.
- **Geist** no texto (`font-sans`).
- **Geist Mono** no código e nas tags de tecnologia (`font-mono`).
- As três vêm do `next/font/google`: baixadas no build e servidas pelo próprio app, sem acesso ao Google no navegador (a CSP continua `font-src 'self'`).
- Números alinhados (contadores, datas) com a classe `.tabular`.

## Forma e profundidade (V4-A, como no Orçô)

- **Cantos:** 8 px (`--radius: 0.5rem`) em botões, campos e cartões; 999 px só em selos de estado.
- **Sombras:** nenhuma no app, só bordas. Sombra leve só em sobreposições (menus, janelas).
- **Foco:** contorno de 2 px na cor `ring` (a primária), com afastamento de 2 px, sempre visível no teclado.
- **Alvos de toque:** no celular (abaixo de 640 px), botões, campos e itens de menu têm pelo menos 44 px (`--touch-target`); botões de ícone ganham uma área de toque invisível desse tamanho.

## Temas (V7-A)

- **Automático** (segue o sistema), pelo `next-themes`, que aplica a classe `.dark` no `<html>`. O script que evita a "piscada" do tema errado usa o nonce da CSP.
- O botão para fixar **Claro** ou **Escuro** entra no cabeçalho do site, na M1; para quem tem conta, a escolha também vai para o perfil.
- A cor da barra do navegador no celular (`theme-color`) acompanha o fundo de cada tema.

## Tom dos textos (V6-A)

**Humor nas bordas, clareza no que importa.**

| Onde | Tom | Exemplo |
|---|---|---|
| Botões principais, telas vazias, mensagens de sucesso | temático | "Enterrar um projeto", "Nenhum projeto enterrado por aqui. Ainda." |
| Erros, segurança, ações sem volta, formulários | direto | "E-mail ou senha incorretos.", "Isto apaga seus projetos e não tem volta." |

Os textos exatos de cada tela continuam sendo decididos na issue de cada fluxo.
