# ADR-0004 — Imagens no RustFS, processadas pelo sharp

- **Status:** aceito (decidido pelo usuário em 2026-10-05: N8-B, N17-A, N19-B, P6-A, I4-A)
- **Data:** 2026-10-05

## Contexto
O Codetomb recebe imagens em três lugares: a galeria do projeto (até 5), as atualizações (até 3) e a foto de perfil (opcional). Uma foto de celular pode ter vários MB e trazer a localização GPS de onde foi tirada, escondida nos metadados. O usuário já usa o RustFS no Orçô.

## Decisão
- **RustFS** (compatível com S3), um por ambiente, com volume próprio e **sem porta publicada**. O acesso é pela biblioteca oficial `@aws-sdk/client-s3`.
- **Todo upload passa pelo sharp no servidor**:
  - conversão para **WebP**;
  - no máximo **1920 px** de largura;
  - **remoção dos metadados**;
  - miniatura de **400 px** para o feed.
- O tipo do arquivo é conferido pelos primeiros bytes. Aceitos: PNG, JPEG e WebP. SVG é proibido.
- Até 5 MB por arquivo, o mesmo limite do Nginx e das Server Actions.
- Nomes aleatórios (`{uuid}.webp`), sem o id do usuário.
- **Exibição por uma rota do app**, com cache imutável. A rota confere se o conteúdo ainda está visível, então uma imagem de conteúdo removido pela moderação deixa de ser servida.

## Alternativas descartadas
- Guardar o original (P6-B): vaza a localização e gasta disco.
- Nginx servindo os arquivos direto (I4-B): mais rápido, mas sem como esconder o conteúdo removido. Fica como otimização futura.
- Links assinados (I4-C): mais complexo, sem ganho para conteúdo público.

## Consequências
- O processamento usa CPU da VPS a cada upload, mas os limites de uso (40 imagens por dia) seguram o pico.
- O RustFS não participa da cascata do banco: as exclusões apagam os arquivos de forma explícita.
- O RustFS é recente: versão fixa, atualizada só depois de testar.
- As imagens ficam fora do backup (I6-A).
