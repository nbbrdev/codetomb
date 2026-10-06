# ADR-0006 — E-mail por SMTP: Resend e Mailpit

- **Status:** aceito (decidido pelo usuário em 2026-10-05: I5-A)
- **Data:** 2026-10-05

## Contexto
O login por e-mail e senha (N1-C) precisa mandar a confirmação de cadastro e a recuperação de senha. O usuário já tem conta no Resend, usada pelo Orçô.

## Decisão
- **Nodemailer com SMTP**, trocável por configuração.
- **Resend** no staging e na produção, com o domínio `codetomb.nbbrdev.com` verificado. Remetente: `Codetomb <nao-responda@codetomb.nbbrdev.com>`.
- Uma API key por ambiente, só com permissão de envio e só para esse domínio.
- **Mailpit** no desenvolvimento local e no CI.

## Alternativas descartadas
- Outro serviço (Brevo, Amazon SES): mais uma conta, sem ganho no começo.

## Consequências
- O plano gratuito do Resend tem **100 e-mails por dia somando o Orçô e o Codetomb**. O teto de 60 e-mails de cadastro por dia (RN-39) protege a cota. Se o Codetomb crescer, o plano pago passa a ser necessário.
- As notificações por e-mail (N14-C, Backlog) aumentariam o volume: reavaliar o plano quando forem promovidas.
