# ADR-0002 — Login com GitHub e com e-mail e senha, pelo Better Auth

- **Status:** aceito (decidido pelo usuário em 2026-10-05 e 2026-10-06: N1-C, P3-A, S2-A, S3-A, S4-A, S6-A)
- **Data:** 2026-10-06

## Contexto
O público são desenvolvedores, e quase todos têm conta no GitHub. O usuário quer também e-mail e senha, para não deixar ninguém de fora. Isso traz senha, confirmação de e-mail, recuperação de senha e a questão de a mesma pessoa entrar pelos dois caminhos.

## Decisão
- **Better Auth**, como no Orçô, com sessões no Postgres (schema `auth`, role `app_auth`).
- Métodos: **GitHub OAuth** e **e-mail e senha** (mínimo de 8 caracteres).
- **Confirmação de e-mail** obrigatória para participar. O GitHub conta como confirmado.
- **Vínculo automático** das duas formas de login quando o e-mail é o mesmo e está **verificado nos dois lados**.
- **Cadastro sem CAPTCHA:** 3 por hora por IP, honeypot e teto de 60 e-mails de cadastro por dia, conferidos numa Server Action. As rotas públicas de cadastro do Better Auth ficam desligadas.
- Uma **OAuth App do GitHub por ambiente** (I7-A).

## Alternativas descartadas
- Só GitHub (N1-A): mais simples, mas exclui quem não tem conta lá.
- Auth.js: mais fraco em e-mail e senha.
- CAPTCHA (S4-B): serviço externo e atrito no cadastro.
- Checagem de senha vazada (S3-B): fica no Backlog.

## Consequências
- O cadastro por e-mail depende do envio de e-mail ([ADR-0006](0006-email-smtp.md)).
- Risco aceito: um ataque de muitos IPs ainda passa pela proteção do cadastro. Se houver abuso, reavaliar um CAPTCHA que rode no próprio servidor.
