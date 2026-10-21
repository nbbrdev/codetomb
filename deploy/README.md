# Deploy na VPS

Como o Codetomb é configurado na VPS e como os deploys funcionam. Decisões em [ADR-0007](../docs/decisoes/0007-hospedagem-vps.md), [ADR-0008](../docs/decisoes/0008-versionamento-releases-e-em-breve.md) e [ADR-0010](../docs/decisoes/0010-sem-staging.md), visão geral em [docs/08-infra-deploy.md](../docs/08-infra-deploy.md).

**Pré-requisito:** a VPS preparada pelo guia do repositório privado **`nbbrdev/vps`** (usuário de administração, SSH só por chave, firewall, Docker, usuário `deploy`, Nginx base e Certbot instalados). A VPS é compartilhada com o Orçô: aqui fica só o que é **do Codetomb**.

**Só há produção** (ADR-0010): não existe staging. O teste acontece localmente, antes do release (`docs/06-regras-dev.md` §7, "Preview local").

## Arquivos desta pasta

| Arquivo                           | Para quê                                                                                                    |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `compose.yaml`                    | A produção (app, migrate, db). Vai **dentro da imagem** e o `deploy.sh` copia para a VPS a cada deploy      |
| `env.example`                     | Modelo do `.env` da produção na VPS (segredos)                                                              |
| `deploy.sh`                       | Único comando que a chave de deploy do Codetomb consegue rodar. Instalado **à mão** em `/opt/codetomb/bin/` |
| `nginx/codetomb.nbbrdev.com.conf` | Site do Codetomb no Nginx: `codetomb.nbbrdev.com` → `127.0.0.1:3010`                                        |

## Como um deploy acontece

1. Você cria uma release: `gh release create vX.Y.Z --target main --generate-notes`.
2. O `production.yml` confere a tag (formato, commit na `main`, CI verde), constrói a imagem `ghcr.io/nbbrdev/codetomb:vX.Y.Z` e envia ao GHCR.
3. O workflow conecta por SSH com a **chave da produção** e manda só `vX.Y.Z@sha256:<digest>`.
4. Na VPS, essa chave só consegue rodar `/opt/codetomb/bin/deploy.sh production`, que:
   - valida o pedido (formato da versão + digest);
   - baixa a imagem e copia de dentro dela o `compose.yaml` e o bootstrap do banco para `/opt/codetomb/production/`;
   - grava a versão em `image.env`;
   - aplica as migrations e sobe a nova versão.

Um merge na `main` **não** publica nada: só roda o CI. Até o lançamento (`v1.0.0`), a produção mostra só a página **"Em breve"** (ver **Lançamento**, abaixo).

O que é do Codetomb na VPS:

```
/opt/codetomb/
├── bin/deploy.sh          ← dono root; o usuário deploy só executa
└── production/            ← dono deploy, chmod 700
    ├── .env               ← segredos da produção (você cria, chmod 600)
    ├── image.env          ← versão no ar (deploy.sh)
    ├── compose.yaml       ← da imagem da versão no ar
    └── init.sh, roles.sql ← idem (criam as roles na primeira subida do banco)

/etc/nginx/sites-available/codetomb.nbbrdev.com   ← o site (deste repositório)
/home/deploy/.ssh/authorized_keys                 ← uma linha do Codetomb (produção)
Portas: app 3010 e banco 5442, só em 127.0.0.1
```

---

## Configurar o Codetomb na VPS (uma vez)

Troque `IP_DA_VPS` pelo IP e `CHAVE_DA_VPS` pela sua chave de administração. No Windows, use o **Git Bash** e barras normais (`/`). Nos testes de SSH, use sempre `-o IdentitiesOnly=yes` (explicação no guia do `nbbrdev/vps`).

### 0. Recursos da VPS

O Codetomb soma um app e um Postgres aos containers do Orçô. Antes de começar, confira a folga na VPS:

```bash
free -h                 # memória livre ("available")
df -h /                 # disco
sudo docker stats --no-stream   # quanto cada container do Orçô usa hoje
```

### 1. DNS

Na zona `nbbrdev.com` da Hostinger (hPanel → Domínios → DNS), um registro **A** chamado `codetomb`, apontando para o IP da VPS (só IPv4). Confira do PC: `nslookup codetomb.nbbrdev.com`.

### 2. Chave de deploy

No **seu PC**, **sem passphrase** (aperte Enter duas vezes; o GitHub Actions não teria como digitá-la):

```bash
ssh-keygen -t ed25519 -C "codetomb-production-deploy" -f ~/.ssh/codetomb-production-deploy
```

O comando gera a **privada** (vai para o secret do GitHub) e a **pública** `.pub` (vai para a VPS). Na VPS, acrescente uma linha no `authorized_keys` do `deploy`, **sem apagar as linhas do Orçô**:

```bash
sudo nano /home/deploy/.ssh/authorized_keys
```

```
command="/opt/codetomb/bin/deploy.sh production",restrict ssh-ed25519 AAAA... codetomb-production-deploy
```

A linha: as opções, um espaço e o conteúdo inteiro do `.pub` (`cat ~/.ssh/codetomb-production-deploy.pub` no PC), **numa linha só**.

- `command="…"`: a VPS ignora o que o cliente pediu e roda sempre este comando. O pedido original chega ao script em `$SSH_ORIGINAL_COMMAND`.
- `restrict`: sem terminal interativo, sem túneis, sem repasse de chaves.

### 3. Pastas e o `deploy.sh`

```bash
sudo install -d -o root -g root -m 755 /opt/codetomb /opt/codetomb/bin
sudo install -d -o deploy -g deploy -m 700 /opt/codetomb/production
```

Do **PC**, na pasta deste repositório:

```bash
scp -i ~/.ssh/CHAVE_DA_VPS -o IdentitiesOnly=yes deploy/deploy.sh default@IP_DA_VPS:/tmp/codetomb-deploy.sh
```

Na VPS:

```bash
sudo install -o root -g root -m 755 /tmp/codetomb-deploy.sh /opt/codetomb/bin/deploy.sh
rm /tmp/codetomb-deploy.sh
bash -n /opt/codetomb/bin/deploy.sh && echo "sintaxe ok"
```

> O `deploy.sh` **não se atualiza sozinho**, de propósito: ele é a barreira de segurança da chave de deploy. Quando um PR mudar o `deploy/deploy.sh`, repita estes comandos.

**Teste da trava**, do PC:

| Teste         | Comando                                                                                                      | Esperado                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Outro comando | `ssh -i ~/.ssh/codetomb-production-deploy -o IdentitiesOnly=yes deploy@IP_DA_VPS "ls"`                       | `deploy: pedido recusado`                                          |
| Pedido válido | `ssh -i ~/.ssh/codetomb-production-deploy -o IdentitiesOnly=yes deploy@IP_DA_VPS "v0.0.0@sha256:<64 zeros>"` | `deploy: falta /opt/codetomb/production/.env` (até criar o `.env`) |

### 4. `.env` da produção

A partir de `deploy/env.example`. Gere cada senha com `openssl rand -hex 32` (só letras e números: as do banco entram nas URLs de conexão) e guarde todas no gerenciador de senhas. **Senhas diferentes das do Orçô.**

```bash
sudo -u deploy nano /opt/codetomb/production/.env      # sudo -u deploy: o arquivo já nasce do deploy
sudo chmod 600 /opt/codetomb/production/.env
sudo ls -la /opt/codetomb/production                   # -rw------- deploy deploy .env
```

`APP_ENV=production`, `SITE_URL=https://codetomb.nbbrdev.com`, `APP_PORT=3010`, `DB_PORT=5442` e as quatro senhas do banco. **Não coloque `PUBLIC_LAUNCH`** até o lançamento: sem ela, a produção mostra só o "Em breve" (fechado por padrão, NBB-106 E3-A).

### 5. Site no Nginx e certificado

Do PC:

```bash
scp -i ~/.ssh/CHAVE_DA_VPS -o IdentitiesOnly=yes deploy/nginx/codetomb.nbbrdev.com.conf default@IP_DA_VPS:/tmp/
```

Na VPS:

```bash
sudo install -o root -g root -m 644 /tmp/codetomb.nbbrdev.com.conf /etc/nginx/sites-available/codetomb.nbbrdev.com
rm /tmp/codetomb.nbbrdev.com.conf
sudo ln -s /etc/nginx/sites-available/codetomb.nbbrdev.com /etc/nginx/sites-enabled/codetomb.nbbrdev.com
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d codetomb.nbbrdev.com
```

- `sites-available/` guarda os sites; o link em `sites-enabled/` é o que **ativa** um site.
- O Certbot prova ao Let's Encrypt que o domínio aponta para a VPS (pela porta 80), emite o certificado, adiciona o HTTPS a este arquivo na VPS e renova sozinho.
- Até o primeiro deploy, o domínio responde **502** (o Nginx funciona, mas ainda não há app na porta 3010).

### 6. GitHub

**Settings → Environments** → `production`, com _Deployment branches and tags_ → **Selected branches and tags** → **Add deployment branch or tag rule** → _Ref type_ **Tag**, padrão `v*`. Assim, só releases (tags `vX.Y.Z`) conseguem usar a chave da produção. Sem aprovação manual: criar a release já é a aprovação.

Secrets do environment:

| Secret            | Valor                                                                |
| ----------------- | -------------------------------------------------------------------- |
| `VPS_HOST`        | IP da VPS                                                            |
| `VPS_USER`        | `deploy`                                                             |
| `VPS_SSH_KEY`     | conteúdo inteiro do arquivo **privado** `codetomb-production-deploy` |
| `VPS_KNOWN_HOSTS` | saída de `ssh-keyscan -t ed25519 IP_DA_VPS` (no seu PC)              |

Antes de colar o `VPS_KNOWN_HOSTS`, confira que é a sua VPS: `ssh-keyscan -t ed25519 IP_DA_VPS | ssh-keygen -lf -` deve mostrar a mesma impressão digital anotada no guia da VPS.

Depois:

1. Apague a chave **privada** de deploy do seu PC depois de cadastrá-la (se perder, gere outra e troque).
2. **Pacote público (NBB-106 E7-A):** em github.com/nbbrdev → **Packages** → `codetomb` → _Package settings_, confira que a visibilidade é **Public** (senão, _Change visibility_ → **Public**). Sem isso, a VPS não consegue baixar a imagem.

> Sem os secrets, o `production.yml` fica **vermelho**: uma release precisa chegar ao ar.

### 7. Primeira versão

Com o CI da `main` verde:

```bash
gh release create v0.1.0 --target main --generate-notes
```

O `production.yml` confere a tag, constrói a imagem `v0.1.0`, aplica as migrations no banco da produção e sobe o app. Abra `https://codetomb.nbbrdev.com`: aparece o **"Em breve"**, com `v0.1.0` no rodapé.

Próximas versões: a partir da primeira depois da `v1.0.0`, **faça o backup da produção antes de cada release** (seção abaixo) e veja `docs/06-regras-dev.md` §4.1 (como escolher o número).

---

## Lançamento (abrir a produção ao público)

Só na `v1.0.0` (M6, ADR-0008). Depois da release:

```bash
sudo -u deploy nano /opt/codetomb/production/.env      # acrescente a linha PUBLIC_LAUNCH=true
codetomb up -d app                                     # recria o app com a variável nova (atalho em "Operação")
```

O container só vê mudança no `.env` quando é **recriado** (`up -d`; um `restart` não basta). Para fechar de novo, apague a linha e repita o `up -d app`.

---

## Backup pelo DBeaver

Não há backup automático (I6-A). O backup é **manual**, pelo DBeaver, e é **obrigatório antes de cada release a partir da primeira depois da `v1.0.0`** (uma release aplica migrations no banco da produção). Só o banco: as imagens do RustFS (a partir da M2) ficam fora; o backup delas está no Backlog (I6-B).

**Como o DBeaver alcança o banco:** o Postgres escuta só em `127.0.0.1:5442` da VPS. A internet não alcança essa porta. O DBeaver entra na VPS por um **túnel SSH** com a sua chave de administração e, de dentro dela, conversa com o banco.

### Conexão (uma vez)

Nova conexão → **PostgreSQL**:

| Aba  | Campo               | Valor                                                                               |
| ---- | ------------------- | ----------------------------------------------------------------------------------- |
| Main | Host                | `localhost` (é o "localhost" **da VPS**, do outro lado do túnel)                    |
| Main | Port                | `5442`                                                                              |
| Main | Database            | `codetomb`                                                                          |
| Main | Username / Password | `postgres` / a `POSTGRES_PASSWORD` do `.env` da produção (do gerenciador de senhas) |
| SSH  | Use SSH Tunnel      | ligado                                                                              |
| SSH  | Host / Port         | `IP_DA_VPS` / `22`                                                                  |
| SSH  | User Name           | `default`                                                                           |
| SSH  | Authentication      | **Public Key**, com o arquivo da sua chave de administração (`~/.ssh/CHAVE_DA_VPS`) |

Use o superusuário `postgres`: o backup precisa ler tudo (produto, login, funções). As roles do app (`app_user`, `app_auth`) não servem, porque a RLS esconderia os dados.

### Fazer o backup

1. Botão direito no banco `codetomb` **da conexão de produção** → **Tools → Backup**. Confira no cabeçalho da tela que é a conexão com a porta `5442` e o túnel SSH, e não a do banco local (`127.0.0.1:55442`), nem a do Orçô.
2. Marque **todos os schemas** (`public`, `app`, `auth` e o `drizzle`, que guarda o controle das migrations).
3. **Format: Custom** (compactado; é o que o restore usa).
4. Deixe **desligados** o "Do not backup privileges" e o "Discard objects owner": sem os GRANTs, o app não acessa nada depois de restaurar; sem os donos, as funções passariam a ser do `postgres`, que ignora a RLS.
5. Escolha a pasta e um nome com a data (ex.: `codetomb-production-2026-12-01.backup`) → **Start**.

O DBeaver usa o `pg_dump` **do seu PC**. Aponte para (ou deixe o DBeaver baixar) as ferramentas do **PostgreSQL 17**, a mesma versão do servidor.

> O arquivo contém **dados de usuários reais**. Fica só no seu PC, nunca no repositório nem em nuvem.

### Restaurar

Num banco **novo e sem migrations** (ex.: depois de recriar o ambiente): as roles nascem pelo bootstrap (`init.sh`/`roles.sql`) na primeira subida do container, e só então **Tools → Restore** no banco `codetomb`, com o arquivo do backup. Se as migrations já rodaram, as tabelas existem e o restore falha com "already exists".

- Conecte como **`postgres`**: só o superusuário consegue devolver cada objeto ao dono certo e aplicar os GRANTs das outras roles.
- **Format: Custom**; **Clean**, **Create**, **No owner** e **No privileges** desligados.

---

## Operação

Comandos na VPS com o seu usuário. Atalho para não repetir as opções:

```bash
codetomb() { sudo docker compose --project-directory /opt/codetomb/production -p codetomb-production --env-file /opt/codetomb/production/.env --env-file /opt/codetomb/production/image.env "$@"; }
```

| Tarefa                 | Comando                                       |
| ---------------------- | --------------------------------------------- |
| Ver o que está rodando | `codetomb ps`                                 |
| Logs do app            | `codetomb logs -f app`                        |
| Reiniciar o app        | `codetomb restart app`                        |
| Recriar o app (`.env`) | `codetomb up -d app`                          |
| Versão no ar           | `sudo cat /opt/codetomb/production/image.env` |
| Espaço em disco        | `df -h` e `sudo docker system df`             |

- **Rollback de código:** no GitHub, abra a execução do `production.yml` de uma versão anterior e clique em **Re-run all jobs**. Ela sobe de novo aquela imagem exata, com o `compose.yaml` dela. As migrations não voltam: por isso toda migration precisa ser compatível com a versão anterior do código.
- Comandos gerais da VPS (Nginx, firewall, certificados, reboot): guia do `nbbrdev/vps`.
