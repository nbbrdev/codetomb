# 10 — Fluxos

> Status: ⏳ todos propostos, para validar com o usuário no começo da fase de cada um. Última atualização: 2026-10-06
>
> Cada fluxo tem um **orçamento de simplicidade**: o máximo de telas, toques e campos obrigatórios. Uma implementação que estoure esse orçamento é considerada bug de UX. Os detalhes (textos, telas, erros) são decididos na issue de cada fluxo.

## Índice

| # | Fluxo | Ator | Fase | Status |
|---|---|---|---|---|
| F-01 | Entrar ou cadastrar com GitHub | Visitante | M1 | ⏳ |
| F-02 | Cadastro com e-mail e senha | Visitante | M1 | ⏳ |
| F-03 | Entrar com e-mail e senha | Visitante | M1 | ⏳ |
| F-04 | Recuperar senha | Visitante | M1 | ⏳ |
| F-05 | Editar perfil e avatar | Desenvolvedor | M1 | ⏳ |
| F-06 | **Postar um projeto (fluxo principal)** | Desenvolvedor | M2 | ⏳ |
| F-07 | Mudar o estado de um projeto | Desenvolvedor | M2 | ⏳ |
| F-08 | Comentar e reagir | Desenvolvedor | M3 | ⏳ |
| F-09 | Postar uma atualização | Desenvolvedor | M3 | ⏳ |
| F-10 | Explorar projetos | Visitante e desenvolvedor | M4 | ⏳ |
| F-11 | Ver o perfil de alguém | Visitante e desenvolvedor | M1 | ⏳ |
| F-12 | Ver notificações | Desenvolvedor | M5 | ⏳ |
| F-13 | Denunciar | Desenvolvedor | M5 | ⏳ |
| F-14 | Moderar | Admin | M5 | ⏳ |
| F-15 | Excluir a conta | Desenvolvedor | M1 | ⏳ |

---

## F-01 — Entrar ou cadastrar com GitHub · ⏳

**Orçamento:** 0 campos · 1 toque e a tela do GitHub.

1. `/entrar` → **Continuar com GitHub** (no topo, acima do formulário de e-mail).
2. Autoriza no GitHub → volta pela rota do Better Auth.
3. No primeiro acesso, o @usuário e a foto vêm do GitHub. Se o @usuário já existir no Codetomb, ganha um sufixo numérico, e a pessoa pode trocar no perfil.
4. Vai para o feed.

## F-02 — Cadastro com e-mail e senha · ⏳

**Orçamento:** 3 campos obrigatórios (nome, e-mail e senha) · 1 tela e 1 e-mail.

1. `/cadastro` → nome, e-mail e senha → **Criar conta**.
2. A tela mostra "Se este e-mail puder ser usado, enviamos um link para ativar a conta", com o botão **Reenviar**. A resposta é a mesma para conta nova, e-mail já cadastrado e robô (honeypot), para não revelar quais contas existem.
3. O link do e-mail confirma a conta e já entra.

## F-03 — Entrar com e-mail e senha · ⏳

1. `/entrar` → e-mail e senha → feed.
2. Erro genérico "E-mail ou senha incorretos", sem dizer qual dos dois.

## F-04 — Recuperar senha · ⏳

1. `/recuperar-senha` → e-mail → mensagem genérica.
2. O link do e-mail leva a `/redefinir-senha` → nova senha → encerra as outras sessões → entra.

## F-05 — Editar perfil e avatar · ⏳

1. Menu → **Meu perfil** → editar nome, @usuário, bio e link do GitHub.
2. Avatar: **Enviar foto** ou **Remover foto** (volta às iniciais).

## F-06 — Postar um projeto (fluxo principal) · ⏳

**Orçamento:** 3 campos obrigatórios (nome, descrição e motivo) · 1 tela.

1. **Enterrar um projeto** (botão principal) → formulário com nome, descrição (Markdown, com prévia), motivo do abandono, estado, link do repositório, tags e imagens.
2. **Publicar** → página do projeto.

## F-07 — Mudar o estado de um projeto · ⏳

**Orçamento:** 2 toques.

1. Na página do próprio projeto → seletor de estado → escolhe o novo estado. A mudança vale na hora.

## F-08 — Comentar e reagir · ⏳

1. Na página do projeto → escreve o comentário → **Comentar**. Ou **Responder** num comentário.
2. Reações: um toque reage, outro toque desfaz.
3. Sem login: os botões levam a `/entrar` e voltam ao projeto depois.

## F-09 — Postar uma atualização · ⏳

1. Na página do próprio projeto → **Nova atualização** → texto (Markdown) e até 3 imagens → **Publicar**.

## F-10 — Explorar projetos · ⏳

1. Página inicial = feed, com as abas **Recentes** e **Em alta**.
2. Busca por nome, filtros por estado e por tag (ex.: 🔎 Procurando equipe + `rust`).
3. **Carregar mais** no fim da lista.

## F-11 — Ver o perfil de alguém · ⏳

1. Clicar no nome ou no avatar → `/@usuario` com a bio, o link do GitHub e os projetos.

## F-12 — Ver notificações · ⏳

1. O sininho mostra o número de não lidas → abre a lista → cada item leva ao projeto ou ao comentário.
2. Abrir a lista marca todas como lidas.

## F-13 — Denunciar · ⏳

**Orçamento:** 2 toques e 1 campo opcional.

1. Menu "⋯" do conteúdo → **Denunciar** → motivo (lista) e detalhes (opcional) → **Enviar**.
2. Mensagem: "Obrigado. Vamos analisar."

## F-14 — Moderar · ⏳

1. `/admin` (só para admin) → lista de denúncias abertas → abre o conteúdo → **Manter**, **Remover conteúdo** ou **Bloquear usuário**.

## F-15 — Excluir a conta · ⏳

1. Perfil → **Excluir conta** → explica o que é apagado (RN-07) → digita "EXCLUIR" → conta apagada e sessão encerrada.
