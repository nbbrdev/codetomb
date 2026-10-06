# 03 — Requisitos

> Status: rascunho para validação · Última atualização: 2026-10-06
>
> RF = requisito funcional · RNF = requisito não funcional. Referências cruzadas: RN ([09-regras-negocio.md](09-regras-negocio.md)) e F ([10-fluxos.md](10-fluxos.md)).

## Requisitos funcionais

### Conta e perfil (M1)
| # | Requisito | Refs |
|---|---|---|
| RF-01 | Cadastro e login com GitHub (OAuth). | F-01, RN-01 |
| RF-02 | Cadastro por e-mail e senha, com confirmação de e-mail. | F-02, RN-02, RN-03 |
| RF-03 | Login por e-mail e senha. | F-03 |
| RF-04 | Recuperação de senha por e-mail. | F-04 |
| RF-05 | Proteção do cadastro contra robôs, sem CAPTCHA. | RN-39 |
| RF-06 | Vínculo automático entre o GitHub e o e-mail e senha. | RN-04 |
| RF-07 | Editar o perfil: nome, @usuário, bio e link do GitHub. | F-05, RN-05, RN-08 |
| RF-08 | Avatar gerado pelas iniciais, com upload, troca e remoção de foto. | F-05, RN-06 |
| RF-09 | Página pública do perfil, com os projetos da pessoa. | F-11, RN-05 |
| RF-10 | Logout. | — |
| RF-11 | Excluir a conta. | F-15, RN-07, RN-09 |

### Projetos (M2)
| # | Requisito | Refs |
|---|---|---|
| RF-12 | Criar, editar e excluir projetos. | F-06, RN-10, RN-17, RN-19 |
| RF-13 | Mudar o estado do projeto. | F-07, RN-11 |
| RF-14 | Galeria de imagens: enviar, remover e reordenar. | F-06, RN-14 a RN-16 |
| RF-15 | Descrição em Markdown, mostrada com segurança. | RN-12, RN-13 |
| RF-16 | Página pública do projeto, com a galeria, as atualizações, os comentários e as reações. | F-10, RN-27 |

### Interação (M3)
| # | Requisito | Refs |
|---|---|---|
| RF-17 | Comentar e responder comentários; editar e excluir os próprios. | F-08, RN-22, RN-23, RN-25 |
| RF-18 | Reagir e desfazer a reação. | F-08, RN-24 |
| RF-19 | Postar, editar e excluir atualizações com imagens. | F-09, RN-20, RN-21 |

### Descoberta (M4)
| # | Requisito | Refs |
|---|---|---|
| RF-20 | Feed de recentes e feed em alta. | F-10, RN-28, RN-29 |
| RF-21 | Busca por nome e filtros por tag e estado. | F-10, RN-30 |
| RF-22 | "Carregar mais" no feed e nos comentários. | RN-31 |

### Comunidade segura (M5)
| # | Requisito | Refs |
|---|---|---|
| RF-23 | Sininho de notificações, com contador e "marcar como lidas". | F-12, RN-32, RN-33 |
| RF-24 | Denunciar conteúdo. | F-13, RN-34 |
| RF-25 | Painel de admin: ver denúncias, remover conteúdo e bloquear ou desbloquear usuários. | F-14, RN-35 a RN-37 |
| RF-26 | Limites de uso por usuário. | RN-38 |

### Lançamento (M6)
| # | Requisito | Refs |
|---|---|---|
| RF-27 | Páginas de termos de uso e de política de privacidade. | — |
| RF-28 | SEO: título, descrição e imagem de compartilhamento por página, e sitemap. | — |

## Requisitos não funcionais (⏳ propostos)

| # | Requisito |
|---|---|
| RNF-01 | Interface em pt-BR (N15-A), responsiva, testada em 360 px e no computador, com tema claro e escuro. |
| RNF-02 | Acessibilidade: todo campo com label, todo botão-ícone com `aria-label`, contraste AA. |
| RNF-03 | Segurança conforme [07-seguranca.md](07-seguranca.md): RLS em todas as tabelas, validação no servidor, CSP com nonce. |
| RNF-04 | LCP abaixo de 2,5 s numa conexão 4G, nas páginas públicas (feed e projeto). |
| RNF-05 | Imagens servidas com cache imutável e miniaturas no feed (RN-15). |
| RNF-06 | Nenhum dado pessoal nos logs. |
| RNF-07 | Fluxos principais cobertos por E2E: F-01, F-02, F-06, F-08 e F-13. |
| RNF-08 | Portabilidade: arquivos pela API S3 e e-mail por SMTP, trocáveis por configuração. |
