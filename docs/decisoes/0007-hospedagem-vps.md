# ADR-0007 — Hospedagem na VPS própria, ao lado do Orçô

- **Status:** aceito (decidido pelo usuário em 2026-10-05: I1-A, I2-A, I3-A, I6-A). **Revisto em 2026-10-21 pelo [ADR-0010](0010-sem-staging.md):** sem staging; as partes riscadas abaixo não valem mais.
- **Data:** 2026-10-05

## Contexto
O usuário já tem uma VPS (Hostinger KVM 2, Ubuntu) com a base comum pronta (SSH só por chave, firewall, Nginx e Certbot) e o Orçô rodando nela, com deploy automatizado pelo GitHub Actions.

## Decisão
- **Mesma VPS**, com o Codetomb isolado em `/opt/codetomb` e ~~em dois projetos Compose (`codetomb-staging` e `codetomb-production`), cada um~~ no projeto Compose `codetomb-production` (ADR-0010), com rede e volumes próprios.
- **Endereço:** `codetomb.nbbrdev.com` ~~e `staging.codetomb.nbbrdev.com`~~ (ADR-0010).
- **Portas** só em `127.0.0.1`, numa faixa própria: app 3010 ~~e 3011~~, banco 5442 ~~e 5443~~ (ADR-0010).
- **Deploy** igual ao do Orçô: imagem no GHCR, SSH com uma chave ~~por ambiente~~ (só a da produção, ADR-0010) presa ao `deploy.sh`, migrations antes do `up -d`.
- **Backup** manual do banco pelo DBeaver antes de cada release (a partir da primeira depois da `v1.0.0`). As imagens ficam fora.

## Alternativas descartadas
- Domínio próprio (I1-B): custo anual. Pode vir depois, com o trabalho de migrar o DNS, o certificado, o OAuth, o Resend e os redirecionamentos.
- ~~Só produção, sem staging (I2-B): sem lugar para ver a mudança antes do público.~~ Adotado em 2026-10-21 (ADR-0010), com o preview local no lugar do staging.
- Backup das imagens (I6-B): fica no Backlog.

## Consequências
- O Codetomb divide a memória e o disco da KVM 2 com o Orçô. No primeiro deploy, conferir os recursos.
- Um problema na VPS derruba os dois projetos. Risco aceito para projetos pequenos.
