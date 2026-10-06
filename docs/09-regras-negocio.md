# 09 — Regras de negócio

> Status: ✅ = decidido pelo usuário (com o código da decisão) · ⏳ = proposto, ainda não confirmado.
> Última atualização: 2026-10-06
>
> As regras são numeradas (`RN-xx`) e **nunca renumeradas**. Uma regra removida fica riscada, com a data e o motivo. Código, testes e issues citam o número.

## Conta e perfil

| # | Regra | Status |
|---|---|---|
| RN-01 | A conta é criada com **GitHub** ou com **e-mail e senha**. | ✅ N1-C |
| RN-02 | A senha tem **no mínimo 8 caracteres**, sem exigência de tipos de caractere. | ✅ S3-A |
| RN-03 | Para **participar** (postar, comentar, reagir, denunciar), a conta precisa ter o e-mail confirmado. Sem confirmar, a pessoa entra, lê e edita o perfil. O login pelo GitHub conta como confirmado. | ✅ S6-A |
| RN-04 | Se a mesma pessoa entra com o GitHub e com e-mail e senha usando o mesmo e-mail, as duas formas viram **uma conta só**, mas apenas com o e-mail verificado nos dois lados. | ✅ S2-A |
| RN-05 | O perfil tem nome, @usuário, avatar, bio curta, link do GitHub (opcional) e a lista de projetos da pessoa. | ✅ N12-A |
| RN-06 | O avatar padrão é gerado a partir das iniciais. Quem entrou pelo GitHub começa com a foto de lá. Qualquer pessoa pode enviar uma foto (opcional), que passa pelo mesmo tratamento das imagens (RN-15). | ✅ N19-A+B |
| RN-07 | **Excluir a conta** apaga os dados pessoais, os projetos (com as atualizações e as imagens), as reações e as notificações. Os comentários feitos em projetos de outras pessoas continuam, com o autor "[usuário removido]" e sem nenhuma ligação com a conta. | ✅ N20-A |
| RN-08 | Limites de tamanho: nome até 60 caracteres, @usuário de 3 a 30 (letras minúsculas, números e `-`), bio até 280. O @usuário é único. | ⏳ |
| RN-09 | A exclusão da conta pede confirmação digitando "EXCLUIR". | ⏳ |

## Projetos

| # | Regra | Status |
|---|---|---|
| RN-10 | Um projeto tem **nome**, **descrição** e **motivo do abandono** (obrigatórios), e **link do repositório** e **tags de tecnologia** (opcionais). | ✅ N2-B |
| RN-11 | Estados do projeto: 🫁 **Respirando por aparelhos**, 🪦 **Abandonado**, 🔎 **Procurando equipe** e 🧟 **Revivido**. O autor muda o estado livremente, em qualquer ordem. | ✅ N3, N9-A |
| RN-12 | A descrição e as atualizações aceitam **Markdown**, sem HTML bruto. O motivo e os comentários são texto simples. | ✅ P7-B (⏳ o motivo em texto simples) |
| RN-13 | Os links no Markdown abrem com `rel="nofollow ugc noopener"`. Imagens externas no Markdown são bloqueadas: imagem só pela galeria. | ✅ S8-A |
| RN-14 | A **galeria** do projeto tem até **5 imagens** de até **5 MB** cada. | ✅ N8-B |
| RN-15 | Toda imagem enviada é convertida para **WebP**, reduzida para no máximo **1920 px** de largura e limpa de metadados (incluindo GPS), e ganha uma miniatura de **400 px**. | ✅ P6-A |
| RN-16 | Formatos aceitos: PNG, JPEG e WebP. SVG e GIF não são aceitos. | ⏳ |
| RN-17 | Limites de tamanho: nome até 80 caracteres, descrição até 10.000, motivo até 2.000, até 8 tags de até 30 caracteres cada. O link do repositório precisa ser `https://`. | ⏳ |
| RN-18 | O estado inicial de um projeto novo é 🪦 Abandonado, e o autor pode trocar no próprio formulário. | ⏳ |
| RN-19 | Só o autor edita, muda o estado ou exclui o projeto. Excluir apaga as atualizações, os comentários, as reações e as imagens do projeto. | ⏳ |

## Atualizações

| # | Regra | Status |
|---|---|---|
| RN-20 | Só o **autor** posta atualizações no projeto. | ✅ N5-A |
| RN-21 | Uma atualização tem texto em Markdown e até **3 imagens** de até **5 MB**. | ✅ N8, N17-A |

## Comentários e reações

| # | Regra | Status |
|---|---|---|
| RN-22 | Comentários têm **um nível de resposta**: dá para responder um comentário, mas não uma resposta. | ✅ N6-B |
| RN-23 | Um comentário editado mostra "(editado)". Um comentário excluído que tem respostas vira "[comentário removido]". Um sem respostas some. | ✅ N16-B |
| RN-24 | Reações vêm de um **conjunto fixo e pequeno**, com a cara do tema. Cada pessoa dá no máximo uma reação de cada tipo por projeto. As reações exatas serão decididas na M3. | ✅ N7-B (⏳ o conjunto e "uma de cada tipo") |
| RN-25 | Comentário com até 2.000 caracteres. | ⏳ |
| RN-26 | Comentários e reações ficam nos projetos. Atualizações também recebem comentários e reações. | ⏳ |

## Descoberta

| # | Regra | Status |
|---|---|---|
| RN-27 | Tudo é **público para leitura**, sem login. Login só para participar. | ✅ N10-A |
| RN-28 | O feed **recentes** ordena pela data de criação do projeto, do mais novo para o mais antigo. | ✅ N11-C (⏳ data de criação, não de atualização) |
| RN-29 | O feed **em alta** ordena pela pontuação: reações + 2 × comentários, contando só os dos **últimos 7 dias**. | ✅ N18-A |
| RN-30 | Busca por nome do projeto e filtros por tag e por estado, combináveis. | ✅ N11-C |
| RN-31 | Paginação com o botão "Carregar mais", com 20 projetos por vez. | ✅ P8-A (⏳ 20 por vez) |

## Notificações

| # | Regra | Status |
|---|---|---|
| RN-32 | O sininho avisa: comentaram no seu projeto, responderam seu comentário e reagiram ao seu projeto. | ✅ N14-B |
| RN-33 | Ninguém é notificado das próprias ações. Notificações lidas somem depois de 90 dias. | ⏳ |

## Moderação

| # | Regra | Status |
|---|---|---|
| RN-34 | Qualquer pessoa com conta confirmada pode **denunciar** um projeto, uma atualização, um comentário ou um perfil, escolhendo um motivo. | ✅ N13-B (⏳ perfil e lista de motivos) |
| RN-35 | Uma denúncia **não dispara nada automático**. O admin decide no painel: manter, remover o conteúdo ou bloquear o usuário. | ✅ S9-A |
| RN-36 | Um usuário **bloqueado** não consegue entrar, e todo o conteúdo dele fica escondido. | ✅ S9-A |
| RN-37 | Admin é quem tem `role = 'admin'` no banco, definido por um comando SQL documentado. | ✅ S7-A |

## Limites de uso

| # | Regra | Status |
|---|---|---|
| RN-38 | Limites por usuário: projetos 5/dia, atualizações 10/dia, comentários 30/hora, reações 120/hora, denúncias 10/dia, imagens 40/dia. Ao passar do limite, a pessoa vê "Calma! Você atingiu o limite. Tente de novo mais tarde." | ✅ S5-A (⏳ o texto) |
| RN-39 | Cadastro por e-mail: 3 por hora por IP, honeypot e teto de **60 e-mails de cadastro por dia**. Sem CAPTCHA. | ✅ S4-A |
| RN-40 | Os IPs guardados (limites e sessões) são apagados depois de 12 meses. | ⏳ |
