# Pendências

> Perguntas em aberto. Cada uma é decidida com o usuário na issue indicada. Última atualização: 2026-10-06

## Validações

| # | Item | Quando |
|---|---|---|
| P-01 | Confirmar as regras ⏳ de [09-regras-negocio.md](09-regras-negocio.md) (limites de tamanho, formatos, estado inicial etc.) | na issue de cada fase |
| P-02 | Validar os fluxos F-01 a F-15 de [10-fluxos.md](10-fluxos.md) | no começo da fase de cada fluxo |
| P-03 | Métricas de sucesso ([01-visao.md](01-visao.md)) e requisitos não funcionais ([03-requisitos.md](03-requisitos.md)) | M0 |

## Produto

| # | Pergunta | Quando |
|---|---|---|
| P-04 | Conjunto exato de reações (N7-B) | M3 |
| P-05 | Formato do endereço do projeto e do perfil (`/projetos/[id]`, `/@usuario`) | M1 e M2 |
| P-06 | Motivos da lista de denúncia | M5 |
| P-07 | Texto dos termos de uso e da política de privacidade | M6 |
| P-08 | Identidade visual (rodada V) | M0 |

## Infra

| # | Pergunta | Quando |
|---|---|---|
| P-09 | ~~Portas locais~~ **Resolvido:** app 3010 (NBB-102 D3-A); Postgres 55442, RustFS 9010/9011 e Mailpit 1035/8035 (NBB-104 B1-A). | — |
| P-10 | Rotas fora do Basic Auth no staging | M0, issue do deploy |
| P-11 | Nome do bucket do RustFS | M2 |
