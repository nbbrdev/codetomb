# Deploy na VPS

Como o Codetomb é configurado na VPS e como os deploys funcionam. Decisões em [ADR-0007](../docs/decisoes/0007-hospedagem-vps.md) e [ADR-0008](../docs/decisoes/0008-versionamento-releases-e-em-breve.md), visão geral em [docs/08-infra-deploy.md](../docs/08-infra-deploy.md).

**Pré-requisito:** a VPS preparada pelo guia do repositório privado **`nbbrdev/vps`** (usuário de administração, SSH só por chave, firewall, Docker, usuário `deploy`, Nginx base e Certbot instalados). A VPS é compartilhada com o Orçô: aqui fica só o que é **do Codetomb**.

## Arquivos desta pasta

| Arquivo                           | Para quê                                                                                                       |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `compose.yaml`                    | Um ambiente (app, migrate, db). Vai **dentro da imagem** e o `deploy.sh` copia para a VPS a cada deploy        |
| `env.example`                     | Modelo do `.env` de cada ambiente na VPS (segredos)                                                            |
| `deploy.sh`                       | Único comando que as chaves de deploy do Codetomb conseguem rodar. Instalado **à mão** em `/opt/codetomb/bin/` |
| `nginx/codetomb.nbbrdev.com.conf` | Site do Codetomb no Nginx: `codetomb` → `127.0.0.1:3010`, `staging.codetomb` → `127.0.0.1:3011`                |

## Como um deploy acontece

1. Merge na `main` → CI verde → `staging.yml` chama a receita comum `deploy-vps.yml`, que constrói a imagem `ghcr.io/nbbrdev/codetomb:staging-<commit>` e envia ao GHCR.
2. O workflow conecta por SSH com a **chave do staging** e manda só `staging-<commit>@sha256:<digest>`.
3. Na VPS, essa chave só consegue rodar `/opt/codetomb/bin/deploy.sh staging`, que:
   - valida o pedido (formato da etiqueta + digest);
   - baixa a imagem e copia de dentro dela o `compose.yaml` e o bootstrap do banco para `/opt/codetomb/staging/`;
   - grava a versão em `image.env`;
   - aplica as migrations e sobe a nova versão.

A produção segue o mesmo caminho a partir de uma release `vX.Y.Z` (`production.yml` → `deploy-vps.yml`), com a sua própria chave e a pasta `/opt/codetomb/production/`. Até o lançamento (`v1.0.0`), a produção mostra só a página **"Em breve"** (ver **Lançamento**, abaixo).

O que é do Codetomb na VPS:

```
/opt/codetomb/
├── bin/deploy.sh          ← dono root; o usuário deploy só executa
├── staging/               ← dono deploy, chmod 700
│   ├── .env               ← segredos do staging (você cria, chmod 600)
│   ├── image.env          ← versão no ar (deploy.sh)
│   ├── compose.yaml       ← da imagem da versão no ar
│   ├── init.sh, roles.sql ← idem (criam as roles na primeira subida do banco)
└── production/            ← mesma estrutura

/etc/nginx/sites-available/codetomb.nbbrdev.com   ← o site (deste repositório)
/home/deploy/.ssh/authorized_keys                 ← duas linhas do Codetomb (staging e produção)
Portas: app 3010 (produção) e 3011 (staging); banco 5442 e 5443. Todas só em 127.0.0.1
```

---

## Configurar o Codetomb na VPS (uma vez)

Troque `IP_DA_VPS` pelo IP e `CHAVE_DA_VPS` pela sua chave de administração. No Windows, use o **Git Bash** e barras normais (`/`). Nos testes de SSH, use sempre `-o IdentitiesOnly=yes` (explicação no guia do `nbbrdev/vps`).

### 0. Recursos da VPS

O Codetomb soma um app e um Postgres por ambiente aos containers do Orçô. Antes de começar, confira a folga na VPS:

```bash
free -h                 # memória livre ("available")
df -h /                 # disco
sudo docker stats --no-stream   # quanto cada container do Orçô usa hoje
```

### 1. DNS

Na zona `nbbrdev.com` da Hostinger (hPanel → Domínios → DNS), dois registros **A** apontando para o IP da VPS (só IPv4):

- `codetomb`
- `staging.codetomb`

Confira do PC: `nslookup codetomb.nbbrdev.com` e `nslookup staging.codetomb.nbbrdev.com`.

### 2. Chaves de deploy do Codetomb

No **seu PC**, uma chave por ambiente, **sem passphrase** (aperte Enter duas vezes; o GitHub Actions não teria como digitá-la):

```bash
ssh-keygen -t ed25519 -C "codetomb-staging-deploy" -f ~/.ssh/codetomb-staging-deploy
ssh-keygen -t ed25519 -C "codetomb-production-deploy" -f ~/.ssh/codetomb-production-deploy
```

Cada comando gera a **privada** (vai para o secret do GitHub) e a **pública** `.pub` (vai para a VPS). Na VPS, acrescente uma linha por chave no `authorized_keys` do `deploy`, **sem apagar as linhas do Orçô**:

```bash
sudo nano /home/deploy/.ssh/authorized_keys
```

```
command="/opt/codetomb/bin/deploy.sh staging",restrict ssh-ed25519 AAAA... codetomb-staging-deploy
command="/opt/codetomb/bin/deploy.sh production",restrict ssh-ed25519 AAAA... codetomb-production-deploy
```

Cada linha: as opções, um espaço e o conteúdo inteiro do `.pub` (`cat ~/.ssh/codetomb-staging-deploy.pub` no PC), **numa linha só**.

- `command="…"`: a VPS ignora o que o cliente pediu e roda sempre este comando. O pedido original chega ao script em `$SSH_ORIGINAL_COMMAND`.
- `restrict`: sem terminal interativo, sem túneis, sem repasse de chaves.

### 3. Pastas e o `deploy.sh`

```bash
sudo install -d -o root -g root -m 755 /opt/codetomb /opt/codetomb/bin
sudo install -d -o deploy -g deploy -m 700 /opt/codetomb/staging /opt/codetomb/production
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

> O `deploy.sh` **não se atualiza sozinho**, de propósito: ele é a barreira de segurança das chaves de deploy. Quando um PR mudar o `deploy/deploy.sh`, repita estes comandos.

**Teste da trava**, do PC:

| Teste                    | Comando                                                                                                                  | Esperado                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Outro comando            | `ssh -i ~/.ssh/codetomb-staging-deploy -o IdentitiesOnly=yes deploy@IP_DA_VPS "ls"`                                      | `deploy: pedido recusado`                                       |
| Chave do ambiente errado | `ssh -i ~/.ssh/codetomb-production-deploy -o IdentitiesOnly=yes deploy@IP_DA_VPS "staging-<40 zeros>@sha256:<64 zeros>"` | `pedido recusado … production`                                  |
| Pedido válido            | `ssh -i ~/.ssh/codetomb-staging-deploy -o IdentitiesOnly=yes deploy@IP_DA_VPS "staging-<40 zeros>@sha256:<64 zeros>"`    | `deploy: falta /opt/codetomb/staging/.env` (até criar o `.env`) |

### 4. `.env` do staging

A partir de `deploy/env.example`. Gere cada senha com `openssl rand -hex 32` (só letras e números: as do banco entram nas URLs de conexão) e guarde todas no gerenciador de senhas. **Senhas diferentes das do Orçô.**

```bash
sudo -u deploy nano /opt/codetomb/staging/.env      # sudo -u deploy: o arquivo já nasce do deploy
sudo chmod 600 /opt/codetomb/staging/.env
sudo ls -la /opt/codetomb/staging                   # -rw------- deploy deploy .env
```

`APP_ENV=staging`, `SITE_URL=https://staging.codetomb.nbbrdev.com`, `APP_PORT=3011`, `DB_PORT=5443`, as quatro senhas do banco, e `STAGING_BASIC_AUTH_USER`/`PASSWORD` (o login que o navegador pede no staging; sem eles, o staging responde 503).

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
sudo certbot --nginx -d codetomb.nbbrdev.com -d staging.codetomb.nbbrdev.com
```

- `sites-available/` guarda os sites; o link em `sites-enabled/` é o que **ativa** um site.
- O Certbot prova ao Let's Encrypt que o domínio aponta para a VPS (pela porta 80), emite o certificado, adiciona o HTTPS a este arquivo na VPS e renova sozinho.
- Até o primeiro deploy, os domínios respondem **502** (o Nginx funciona, mas ainda não há app nas portas 3010/3011).

### 6. GitHub

**Settings → Environments** → `staging`, com _Deployment branches and tags_ → **Selected branches and tags** → `main`, e estes secrets:

| Secret            | Valor                                                             |
| ----------------- | ----------------------------------------------------------------- |
| `VPS_HOST`        | IP da VPS                                                         |
| `VPS_USER`        | `deploy`                                                          |
| `VPS_SSH_KEY`     | conteúdo inteiro do arquivo **privado** `codetomb-staging-deploy` |
| `VPS_KNOWN_HOSTS` | saída de `ssh-keyscan -t ed25519 IP_DA_VPS` (no seu PC)           |

Antes de colar o `VPS_KNOWN_HOSTS`, confira que é a sua VPS: `ssh-keyscan -t ed25519 IP_DA_VPS | ssh-keygen -lf -` deve mostrar a mesma impressão digital anotada no guia da VPS.

Depois:

1. Apague as chaves **privadas** de deploy do seu PC depois de cadastrá-las (se perder, gere outras e troque).
2. **Pacote público (NBB-106 E7-A):** o primeiro merge na `main` depois deste PR já constrói a imagem no GHCR. Em github.com/nbbrdev → **Packages** → `codetomb` → _Package settings_ → _Change visibility_ → **Public**. Sem isso, a VPS não consegue baixar a imagem.
3. **Primeiro deploy:** Actions → **Staging** → _Run workflow_ (branch `main`).
4. Abra `https://staging.codetomb.nbbrdev.com`: pede a senha do Basic Auth e mostra `staging-<commit>` no rodapé.

---

## Produção

Com o staging funcionando, a produção reaproveita a mesma VPS, o mesmo `deploy.sh` e o mesmo site do Nginx. Muda a pasta, o `.env`, a chave e o environment.

### 1. `.env` da produção

A partir de `deploy/env.example`, com **senhas diferentes das do staging** (gere cada uma com `openssl rand -hex 32`):

```bash
sudo -u deploy nano /opt/codetomb/production/.env
sudo chmod 600 /opt/codetomb/production/.env
```

Valores que mudam em relação ao staging:

```
APP_ENV=production
SITE_URL=https://codetomb.nbbrdev.com
APP_PORT=3010
DB_PORT=5442
STAGING_BASIC_AUTH_USER=
STAGING_BASIC_AUTH_PASSWORD=
```

**Não coloque `PUBLIC_LAUNCH`** até o lançamento: sem ela, a produção mostra só o "Em breve" (fechado por padrão, NBB-106 E3-A).

A linha da chave `codetomb-production-deploy` já está no `authorized_keys` (passo 2).

### 2. Environment `production` no GitHub

**Settings → Environments** → `production`, com _Deployment branches and tags_ → **Selected branches and tags** → **Add deployment branch or tag rule** → _Ref type_ **Tag**, padrão `v*`. Assim, só releases (tags `vX.Y.Z`) conseguem usar a chave da produção. Sem aprovação manual: criar a release já é a aprovação.

Secrets: os mesmos quatro do staging (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_KNOWN_HOSTS`), mas com o `VPS_SSH_KEY` = conteúdo da chave **privada** `codetomb-production-deploy`.

> Sem esses secrets, o `production.yml` fica **vermelho** (no staging, ele só avisa e pula). Uma release precisa chegar ao ar.

### 3. Primeira versão

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
codetomb production up -d app                          # recria o app com a variável nova (atalho em "Operação")
```

O container só vê mudança no `.env` quando é **recriado** (`up -d`; um `restart` não basta). Para fechar de novo, apague a linha e repita o `up -d app`.

---

## Backup pelo DBeaver

Não há backup automático (I6-A). O backup é **manual**, pelo DBeaver, e é **obrigatório antes de cada release a partir da primeira depois da `v1.0.0`** (uma release aplica migrations no banco da produção). Só o banco: as imagens do RustFS (a partir da M2) ficam fora; o backup delas está no Backlog (I6-B).

**Como o DBeaver alcança o banco:** o Postgres de cada ambiente escuta só em `127.0.0.1` da VPS (`DB_PORT`: 5442 na produção, 5443 no staging). A internet não alcança essas portas. O DBeaver entra na VPS por um **túnel SSH** com a sua chave de administração e, de dentro dela, conversa com o banco.

### Conexão (uma vez por ambiente)

Nova conexão → **PostgreSQL**:

| Aba  | Campo               | Valor                                                                               |
| ---- | ------------------- | ----------------------------------------------------------------------------------- |
| Main | Host                | `localhost` (é o "localhost" **da VPS**, do outro lado do túnel)                    |
| Main | Port                | `5442` (produção) ou `5443` (staging)                                               |
| Main | Database            | `codetomb`                                                                          |
| Main | Username / Password | `postgres` / a `POSTGRES_PASSWORD` do `.env` do ambiente (do gerenciador de senhas) |
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
codetomb() { sudo docker compose --project-directory "/opt/codetomb/$1" -p "codetomb-$1" --env-file "/opt/codetomb/$1/.env" --env-file "/opt/codetomb/$1/image.env" "${@:2}"; }
```

| Tarefa                 | Comando                                    |
| ---------------------- | ------------------------------------------ |
| Ver o que está rodando | `codetomb staging ps`                      |
| Logs do app            | `codetomb staging logs -f app`             |
| Reiniciar o app        | `codetomb staging restart app`             |
| Recriar o app (`.env`) | `codetomb staging up -d app`               |
| Versão no ar           | `sudo cat /opt/codetomb/staging/image.env` |
| Espaço em disco        | `df -h` e `sudo docker system df`          |

- **Rollback de código:** no GitHub, abra uma execução anterior do workflow (Staging ou Production) e clique em **Re-run all jobs**. Ela sobe de novo aquela imagem exata, com o `compose.yaml` dela. As migrations não voltam: por isso toda migration precisa ser compatível com a versão anterior do código.
- Comandos gerais da VPS (Nginx, firewall, certificados, reboot): guia do `nbbrdev/vps`.
