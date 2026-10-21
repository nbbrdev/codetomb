#!/usr/bin/env bash
# Deploy da produção do Codetomb na VPS (ADR-0007, docs/08-infra-deploy.md). Não há staging
# (ADR-0010): o único ambiente é a produção, e só uma release (tag vX.Y.Z) chega até aqui.
#
# É o ÚNICO comando que a chave SSH de deploy do GitHub consegue rodar. No authorized_keys do
# usuário deploy, a chave fica presa a ele:
#   command="/opt/codetomb/bin/deploy.sh production",restrict ssh-ed25519 AAAA... codetomb-production-deploy
#
# O ambiente vem da chave ($1). O workflow só escolhe QUAL imagem subir: o pedido chega em
# $SSH_ORIGINAL_COMMAND no formato vX.Y.Z@sha256:<digest>, e qualquer outra coisa é recusada.
# Os arquivos de deploy (compose.yaml, init.sh, roles.sql) saem de dentro da imagem, nunca do SSH.
#
# Instalação (deploy/README.md): /opt/codetomb/bin/deploy.sh, dono root, modo 755. O usuário deploy
# roda o script, mas não consegue alterá-lo.
set -euo pipefail

readonly REGISTRY="ghcr.io/nbbrdev/codetomb"
readonly ROOT="/opt/codetomb"

fail() {
  echo "deploy: $*" >&2
  exit 1
}

env_name="${1:-}"
request="${SSH_ORIGINAL_COMMAND:-}"

# Só a produção existe. O nome continua no comando da chave para deixar claro qual ambiente ela abre.
[[ "$env_name" == "production" ]] || fail "ambiente inválido: use production."

# Pedido inteiro validado: etiqueta da versão + digest (a impressão digital exata da imagem).
readonly request_pattern='^v[0-9]+\.[0-9]+\.[0-9]+@sha256:[0-9a-f]{64}$'
if ! [[ "$request" =~ $request_pattern ]]; then
  fail "pedido recusado. Formato esperado: vX.Y.Z@sha256:<digest>."
fi

readonly image="${REGISTRY}:${request}"
readonly dir="${ROOT}/${env_name}"
[[ -f "$dir/.env" ]] || fail "falta $dir/.env (veja deploy/README.md)."

# Um deploy por vez.
exec 9>"$dir/.deploy.lock"
flock -n 9 || fail "outro deploy está em andamento."

echo "==> Baixando $image"
docker pull --quiet "$image"

echo "==> Copiando os arquivos de deploy de dentro da imagem"
# `docker create` prepara um container sem ligá-lo, só para ler os arquivos da imagem.
container="$(docker create "$image")"
trap 'docker rm -f "$container" >/dev/null 2>&1 || true' EXIT
docker cp "$container:/app/deploy/." "$dir/"

# A versão fica gravada na pasta: qualquer comando futuro (backup, reinício) usa esta mesma imagem.
printf 'CODETOMB_IMAGE=%s\n' "$image" >"$dir/image.env"

compose() {
  docker compose \
    --project-directory "$dir" \
    --file "$dir/compose.yaml" \
    --project-name "codetomb-$env_name" \
    --env-file "$dir/.env" \
    --env-file "$dir/image.env" \
    "$@"
}

# Primeiro o banco, depois o código (as migrations precisam ser compatíveis com a versão anterior).
echo "==> Aplicando as migrations"
compose run --rm migrate

echo "==> Subindo a nova versão"
compose up --detach --remove-orphans

# Imagens sem uso há mais de 7 dias. As versões continuam no GHCR para um rollback.
echo "==> Limpando imagens antigas"
docker image prune --all --force --filter "until=168h" >/dev/null

echo "Deploy concluído: $request"
