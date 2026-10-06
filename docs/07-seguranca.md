# 07 — Segurança

> Status: decisões S1–S9 do usuário (2026-10-06); o resto segue o Orçô (`orco/docs/07-seguranca.md`) e fica ⏳ até ser implementado e revisado · Última atualização: 2026-10-06
>
> As regras deste documento são **obrigatórias**. Um PR que viole alguma delas não é aprovado.

## 1. Autenticação ([ADR-0002](decisoes/0002-auth-better-auth.md))

- **Senhas só pelo Better Auth**, que faz o hash e guarda no schema `auth` (acessível só pela role `app_auth`). É proibido criar outra tabela de senha ou logar senhas.
- Métodos: **GitHub OAuth** e **e-mail e senha** (N1-C). Senha com no mínimo 8 caracteres (RN-02, S3-A), conferida pelo Zod no servidor e pelo Better Auth.
- **Confirmação de e-mail** para participar (RN-03, S6-A). Links de conta com token de uso único e validade de 1 hora.
- **Vínculo GitHub ↔ e-mail** só com o e-mail verificado nos dois lados (RN-04, S2-A). Assim, quem cadastrasse o e-mail de outra pessoa antes dela não fica com a conta quando a dona entra pelo GitHub.
- **Cadastro sem CAPTCHA** (RN-39, S4-A): limite por IP, honeypot e teto diário de e-mails, conferidos pela Server Action **antes** de criar a conta. As rotas públicas de cadastro, reenvio e recuperação do Better Auth ficam **desligadas** (`disabledPaths`), para ninguém pular essa proteção chamando a API direto.
- Mensagens que **não revelam se uma conta existe** (F-02, F-03, F-04).
- Redefinir a senha encerra todas as sessões da conta.
- **GitHub OAuth:** uma OAuth App por ambiente (I7-A), cada uma só com o endereço de retorno do seu domínio. O segredo de cada uma fica só no `.env` do ambiente.
- **Usuário bloqueado** (RN-36) não consegue entrar, e as sessões dele são encerradas no bloqueio.

## 2. Sessão

- Sessões do Better Auth no Postgres, em cookie `HttpOnly`, `Secure` e `SameSite=Lax`.
- **Toda autorização parte da sessão validada no servidor**, em cada Server Component, Server Action e Route Handler que exige login. Não checar o login no layout: o Next não executa o layout de novo ao navegar.

## 3. Autorização (RLS, [ADR-0003](decisoes/0003-banco-drizzle-rls-roles.md), S1-A)

- **RLS habilitada e forçada em 100% das tabelas do produto**: nada é liberado por padrão.
- **Três roles:** `codetomb_owner` (só migrations), `app_auth` (só login) e `app_user` (produto, sempre com RLS). O app **nunca** conecta como dona, como `postgres` ou com `BYPASSRLS`.
- **Leitura pública** (N10-A): policies de `select` liberam o conteúdo não removido de autores não bloqueados, mesmo sem usuário na transação.
- **Escrita** só do dono: `user_id = app.current_user_id()`. O admin modera por policies próprias que chamam `app.is_admin()` (S7-A).
- **Permissão por coluna** onde há campos do sistema: o usuário não muda a própria `role` nem o `blocked_at`.
- Todo acesso logado passa por `withUserDb(userId, fn)`, que define o usuário **só dentro da transação**.
- Todo PR que cria ou altera uma tabela inclui **teste de RLS contra um Postgres real**: outro usuário não altera; o visitante só lê o que é público; conteúdo removido e autor bloqueado ficam invisíveis; a `app_auth` não alcança o produto.

## 4. Conteúdo de usuário

- **Markdown seguro** (P7-B, S8-A, [ADR-0005](decisoes/0005-markdown-seguro.md)): renderizado **sem HTML bruto**, só com elementos permitidos, links com `rel="nofollow ugc noopener"` e **imagens externas bloqueadas**. Testes unitários com as tentativas de XSS mais comuns.
- **Texto simples** nos comentários: o React escapa tudo, sem `dangerouslySetInnerHTML`.
- **Links do repositório** só com `https://`. `javascript:` e outros esquemas são recusados no servidor.
- **Imagens** (P6-A, [ADR-0004](decisoes/0004-imagens-rustfs-sharp.md)):
  - tipo conferido pelos primeiros bytes do arquivo, não pela extensão; PNG, JPEG e WebP (RN-16); **SVG proibido**, porque pode carregar script;
  - até 5 MB, o mesmo limite do Nginx (`client_max_body_size`) e do `serverActions.bodySizeLimit`;
  - **toda imagem é refeita pelo sharp**: vira WebP, perde os metadados (GPS incluído) e fica com no máximo 1920 px;
  - nome aleatório (UUID), sem o id do usuário;
  - servidas pela rota do app, que confere se o conteúdo ainda está visível (I4-A).
- **IDs internos** de usuário nunca aparecem em URLs públicas; o perfil usa o @usuário.

## 5. Validação de entrada

- Todo dado do navegador é revalidado no servidor com o mesmo schema Zod, inclusive os limites de tamanho (RN-08, RN-17, RN-25), que o banco também confere por `check`.

## 6. Limites de uso e anti-abuso (RN-38, RN-39, S4-A, S5-A)

| Ação | Chave | Limite |
|---|---|---|
| Cadastro por e-mail | IP | 3/hora |
| Reenvio da confirmação | IP | 3/hora |
| E-mails de cadastro | global | 60/dia |
| Login | IP | limite do Better Auth |
| Criar projeto | usuário | 5/dia |
| Postar atualização | usuário | 10/dia |
| Comentar | usuário | 30/hora |
| Reagir | usuário | 120/hora |
| Denunciar | usuário | 10/dia |
| Enviar imagens | usuário | 40/dia |

- Implementados numa tabela e numa função do Postgres. A resposta é amigável (RN-38) e não revela detalhes.
- O Resend gratuito tem **100 e-mails por dia somando o Orçô e o Codetomb** (I5-A). O teto de 60 protege a cota da recuperação de senha.

## 7. Headers HTTP (⏳, igual ao Orçô)

- **CSP com nonce** no `proxy.ts`, nova a cada requisição: `script-src` só com o nonce, `img-src 'self' data:` (avatares do GitHub liberados, se forem usados direto) e `frame-ancestors 'none'`.
- `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` e `Cross-Origin-Opener-Policy`.
- Meta: nota A ou maior no securityheaders.com (M6).

## 8. CSRF

- Server Actions do Next conferem a origem. Rotas que mudam estado nunca são `GET`.

## 9. Staging

- HTTP Basic Auth em todas as rotas, exceto as rotas do Better Auth (o retorno do GitHub) e a de imagens. Quais rotas ficam de fora será confirmado na M0.
- `X-Robots-Tag: noindex, nofollow` e dados sempre fictícios.

## 10. Segredos e repositório público

- Repositório **público**: nenhum segredo, dado real ou dado pessoal em código, docs, testes, seeds ou imagem Docker.
- Segredos só nos `.env` da VPS (`chmod 600`) e no `.env.local` de quem desenvolve. Nunca no chat.
- Secret scanning com push protection ligado no GitHub.

## 11. Dependências e código

- CodeQL (`security-extended`, bloqueante), Dependabot e `npm audit --omit=dev` no CI.
- Actions de terceiros fixadas por SHA; `permissions:` mínimas por job.

## 12. Logs e privacidade (LGPD)

- Logs sem dados pessoais (sem e-mail, sem IP, sem conteúdo), só ids e códigos de erro.
- Exclusão da conta conforme RN-07 (N20-A): os comentários ficam sem nenhum vínculo com a pessoa.
- IPs guardados (limites e sessões) apagados depois de 12 meses (RN-40, ⏳).
- Termos de uso e política de privacidade antes do lançamento (M6).

## 13. Backup

- Backup manual do banco pelo DBeaver, por túnel SSH, antes de cada release a partir da primeira depois da `v1.0.0` (I6-A). As imagens ficam fora: risco aceito, e o backup delas está no Backlog (I6-B).

## Checklist de segurança do PR

- [ ] Nenhum segredo, dado real ou dado pessoal em código, log, teste ou imagem Docker
- [ ] Entrada validada no servidor (Zod) e limites de tamanho no banco
- [ ] Tabela nova ou alterada: RLS `ENABLE` + `FORCE`, policies, grants e teste de RLS
- [ ] Acesso só com a sessão validada no servidor; e-mail confirmado para participar
- [ ] Conteúdo de usuário renderizado sem HTML bruto
- [ ] Ação nova de escrita com limite de uso, quando couber
