# ADR-0005 — Markdown seguro na descrição e nas atualizações

- **Status:** aceito (decidido pelo usuário em 2026-10-05 e 2026-10-06: P7-B, S8-A); a biblioteca é ⏳ proposta
- **Data:** 2026-10-06

## Contexto
Desenvolvedores gostam de colar trechos de código e listas para explicar um projeto. Mas um texto formatado vindo de usuário é a porta clássica do XSS: alguém injeta um script que roda no navegador de quem lê. Além disso, uma imagem externa no texto pode servir para rastrear quem abriu a página.

## Decisão
- **Markdown** na descrição do projeto e nas atualizações. **Texto simples** no motivo e nos comentários.
- Renderização **sem HTML bruto**, com uma lista de elementos permitidos (títulos, listas, ênfase, código, citações, links).
- **Links** com `rel="nofollow ugc noopener"`, aceitos só com `http`/`https`.
- **Imagens externas bloqueadas:** imagem só pela galeria.
- Biblioteca proposta: `react-markdown`, que não interpreta HTML por padrão, renderizada no servidor. A escolha é confirmada na M2.

## Alternativas descartadas
- Texto simples em tudo (P7-A): perde blocos de código.
- Markdown em tudo (P7-C): comentários mais pesados, sem ganho.
- Imagens externas permitidas (S8-B): rastreamento e brechas na CSP.

## Consequências
- Testes unitários com tentativas de XSS conhecidas (`javascript:`, HTML embutido, atributos `on*`).
