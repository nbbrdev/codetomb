# Documentação do Codetomb

> **Codetomb**: o cemitério de projetos dos desenvolvedores. Conte por que desistiu, converse com quem passou pelo mesmo e, quem sabe, reviva o projeto em equipe.

Esta pasta é a **fonte da verdade do conteúdo** do projeto. O **planejamento e o andamento** (fases, marcos, issues) ficam no **Linear**, projeto **Codetomb** (time Nbbr dev, chave `NBB`).

**Produção:** https://codetomb.nbbrdev.com ("Em breve" até a `v1.0.0`) · **Staging:** https://staging.codetomb.nbbrdev.com · **Repositório:** https://github.com/nbbrdev/codetomb

## Índice

| Doc | Conteúdo |
|---|---|
| [01-visao.md](01-visao.md) | Problema, proposta, público, princípios |
| [02-escopo.md](02-escopo.md) | Dentro e fora do MVP, delimitações, Backlog |
| [03-requisitos.md](03-requisitos.md) | Requisitos funcionais (RF) e não funcionais (RNF) |
| [04-arquitetura.md](04-arquitetura.md) | Stack, estrutura de pastas, padrões de fluxo técnico |
| [05-dados.md](05-dados.md) | Roles, schemas, entidades previstas, RLS, arquivos |
| [06-regras-dev.md](06-regras-dev.md) | Processo (Linear, Git), código, banco, testes, variáveis, DoD |
| [07-seguranca.md](07-seguranca.md) | Autenticação, RLS, conteúdo de usuário, limites, headers, LGPD |
| [08-infra-deploy.md](08-infra-deploy.md) | Ambientes, VPS, Docker Compose, Nginx, deploy, backup, DNS |
| [09-regras-negocio.md](09-regras-negocio.md) | Regras de negócio numeradas (RN) |
| [10-fluxos.md](10-fluxos.md) | Jornadas de usuário (F) |
| [11-mapa.md](11-mapa.md) | Atores, entidades, estados, mapa de telas, glossário |
| [12-identidade-visual.md](12-identidade-visual.md) | Cores, tipografia e tom (definidos na rodada V da M0) |
| [decisoes/](decisoes/) | ADRs: registro de decisões técnicas |
| [pendencias.md](pendencias.md) | Perguntas em aberto |

## Fases

| # | Marco | Objetivo | Versão |
|---|---|---|---|
| M0 | Fundação | Docs, repositório e proteções, projeto Next, banco local com roles, identidade visual, CI, deploy do staging e "Em breve" na produção | `0.1.0` |
| M1 | Contas | Login com GitHub e com e-mail, confirmação, recuperação de senha, vínculo de contas, perfil, avatar, exclusão de conta | `0.2.0` |
| M2 | Projetos | Criar, editar e excluir projetos, estados, tags, galeria, Markdown, página pública do projeto | `0.3.0` |
| M3 | Interação | Comentários com resposta, reações, atualizações com imagens | `0.4.0` |
| M4 | Descoberta | Feed de recentes, "em alta", busca, filtros, "Carregar mais" | `0.5.0` |
| M5 | Comunidade segura | Notificações, denúncias, painel de admin, bloqueio, limites de uso | `0.6.0` |
| M6 | Lançamento | Termos e privacidade, SEO, auditoria de segurança, primeiro backup, abertura ao público | **`1.0.0`** |

**Fase atual: M0 (Fundação).**

Até a `v1.0.0`, a produção mostra só a página "Em breve" ([ADR-0008](decisoes/0008-versionamento-releases-e-em-breve.md)). As fases são testadas no staging.

## Como manter

- Mudou algo aqui? Atualize o Linear Doc correspondente na mesma sessão.
- Decisão técnica nova vira ADR em `decisoes/NNNN-titulo.md` (Contexto, Decisão, Consequências).
- Pendência nova: marque `> ⚠️ PENDENTE:` no texto e adicione em [pendencias.md](pendencias.md).
- Status das regras: ✅ decidido pelo usuário · ⏳ proposto (ainda não confirmado).
- Numerações (RN, RF, RNF, F, ADR) nunca são reaproveitadas. O que sai fica riscado, com a data e o motivo.
