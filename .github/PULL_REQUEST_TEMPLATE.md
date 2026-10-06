<!--
Título do PR = commit na main (squash). Formato: tipo(escopo): descrição [NBB-xx]
Ex.: feat(projects): adiciona galeria de imagens [NBB-120]
Tipos: feat, fix, perf, security, docs, refactor, test, chore, ci
-->

## Issue

NBB-xx: <o que a issue pede, em uma frase>. Decisões do usuário em AAAA-MM-DD: <códigos, ex.: D1-A, D2-B>.

## O que muda

<!-- Por arquivo ou por assunto, em linguagem simples, com o porquê. Termo técnico: uma frase dizendo o que é. -->

-

## ⚠️ Antes do merge (na VPS)

<!-- Só se o PR exige variável nova no .env do servidor ou outra ação manual. Senão, apague esta seção. -->

## Pontos para revisar (decididos por mim)

<!--
Tudo o que não veio de uma decisão do usuário: textos, nomes, valores, detalhes de implementação,
correções fora do escopo. Depois do OK, troque o título para
"(decididos por mim; aprovados pelo usuário em AAAA-MM-DD)". Sem pontos: "Nenhuma decisão nova".
-->

1.

## Como testar

<!-- Não há preview por PR: teste a branch localmente e, depois do merge, no staging. -->

1.

## Testes

<!-- O que rodou (lint, tipos, build, unitários, integração, E2E) e o que foi conferido à mão (capturas em 360 px, tema claro e escuro, computador). -->

-

## Checklist de simplicidade

- [ ] Não adiciona passo, campo obrigatório ou tela ao fluxo principal (ou a justificativa está acima)

## Checklist de segurança

- [ ] Nenhum segredo, dado real ou dado pessoal em código, log, teste ou imagem Docker
- [ ] Entrada validada no servidor (Zod) e limites de tamanho no banco
- [ ] Tabela nova ou alterada: RLS `ENABLE` + `FORCE`, policies, grants e teste de RLS
- [ ] Acesso só com a sessão validada no servidor; e-mail confirmado para participar
- [ ] Conteúdo de usuário renderizado sem HTML bruto
- [ ] Ação nova de escrita com limite de uso, quando couber

## Documentação

- [ ] `docs/` atualizado (ou não se aplica)
- [ ] Linear Docs sincronizados (ou não se aplica)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
