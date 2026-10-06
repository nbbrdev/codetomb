# 02 — Escopo e delimitações

> Status: decisões do usuário de 2026-10-05 e 2026-10-06 (rodadas N, P, I, S e F) · Última atualização: 2026-10-06
>
> Este é o documento mais importante do projeto. **Nada é implementado se não estiver em "Dentro do MVP".** Uma ideia nova vira issue no **Backlog do Linear, sem marco**, até o usuário promovê-la. Mudanças aqui atualizam o Linear Doc "Escopo" na mesma sessão.

## O que o Codetomb É

Uma rede social para desenvolvedores divulgarem **projetos abandonados e o motivo do abandono**, conversarem sobre eles e, quem sabe, revivê-los.

## O que o Codetomb NÃO É (delimitações)

- **Não é hospedagem de código:** não guarda repositórios, só aponta para eles (link opcional).
- **Não é gerenciador de projetos:** não tem tarefas, quadros nem prazos.
- **Não é chat:** não há mensagens privadas. A conversa é pública, nos comentários.
- **Não é marketplace:** não intermedeia contratação nem pagamento.
- **Ainda não forma equipes dentro da plataforma:** no MVP, os interessados combinam pelos comentários ou fora dela (N4-A). O recurso de time é a próxima entrega.

## Dentro do MVP

### Conta (M1)
- Cadastro e login com **GitHub** e com **e-mail e senha** (N1-C). Confirmação de e-mail obrigatória para participar (S6-A) e recuperação de senha por e-mail.
- Vínculo automático das duas formas de login quando o e-mail é o mesmo e está verificado nos dois lados (S2-A).
- Proteção do cadastro sem CAPTCHA: limite por IP, honeypot e teto diário de e-mails (S4-A).
- **Perfil mínimo:** nome, @usuário, avatar, bio curta, link do GitHub (opcional) e a lista de projetos da pessoa (N12-A).
- **Avatar:** gerado pelas iniciais por padrão, com upload de foto opcional (N19-A+B).
- Exclusão da própria conta (N20-A).

### Projetos (M2)
- Criar, editar e excluir projetos com nome, descrição, motivo do abandono, link do repositório (opcional) e tags de tecnologia (opcional) (N2-B).
- **Galeria** de até 5 imagens de até 5 MB (N8-B). Toda imagem é convertida para WebP, reduzida e limpa de metadados (P6-A).
- Descrição em **Markdown**, sem HTML bruto e sem imagens externas (P7-B, S8-A).
- **Estados:** 🫁 Respirando por aparelhos, 🪦 Abandonado, 🔎 Procurando equipe e 🧟 Revivido. O autor muda o estado livremente (N3, N9-A).
- Página pública do projeto: qualquer pessoa lê, sem login (N10-A).

### Interação (M3)
- **Comentários** com um nível de resposta (N6-B), em texto simples (P7-B). Comentário editado mostra "(editado)", e comentário excluído que tem respostas vira "[comentário removido]" (N16-B).
- **Reações:** conjunto fixo e pequeno, com a cara do tema (N7-B). Quais exatamente será decidido na M3.
- **Atualizações** do projeto, postadas só pelo autor (N5-A), em Markdown e com até 3 imagens de até 5 MB (N8, N17-A).

### Descoberta (M4)
- Feed de **recentes** e feed **em alta** (N11-C). A pontuação do "em alta" é reações + 2 × comentários dos últimos 7 dias (N18-A).
- **Busca** por nome e **filtros** por tag e por estado.
- Paginação com o botão **"Carregar mais"** (P8-A).

### Comunidade segura (M5)
- **Notificações dentro do site** (sininho): comentaram no seu projeto, responderam seu comentário, reagiram (N14-B).
- Botão **"Denunciar"** em projeto, comentário, atualização e perfil, e um **painel de admin** para remover conteúdo e bloquear usuários (N13-B, S9-A).
- **Limites de uso** por usuário contra spam (S5-A).

### Lançamento (M6)
- Termos de uso e política de privacidade.
- SEO básico (título, descrição, imagem de compartilhamento, sitemap).
- Auditoria de segurança e primeiro backup.
- Abertura da produção ao público (`v1.0.0`).

### Plataforma
- Interface só em **pt-BR** (N15-A), com tema claro e escuro (rodada V, M0).
- Funciona bem no celular (360 px) e no computador.

## Fora do MVP (Backlog, sem marco)

| Item | Origem |
|---|---|
| "Quero participar": o autor aceita colaboradores, que aparecem no projeto e também postam atualizações | N4-B, N5-B (próxima entrega) |
| Perfil completo: links extras e tecnologias que a pessoa conhece | N12-B |
| Notificações por e-mail, que a pessoa liga ou desliga | N14-C |
| Rolagem infinita no feed | P8-B |
| Checagem de senha vazada (HaveIBeenPwned) | S3-B |
| Limites menores nas primeiras 24 h da conta | S5-B |
| Backup das imagens para fora da VPS | I6-B |
| Campos extras no projeto (período ativo, quanto ficou pronto, o que falta) | N2 |
| Mensagens privadas, chat de equipe | N4-C (descartado no MVP) |
| Tradução para outros idiomas | N15 |
| Domínio próprio | I1 |
