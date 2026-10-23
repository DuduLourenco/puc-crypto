#!/usr/bin/env bash
# Gera as imagens e publica no Docker Hub, como <usuário>/puccrypto-<serviço>:<tag> e :latest.
#
#   infra/publish-images.sh                  # todos os serviços
#   infra/publish-images.sh bff catalog      # apenas os informados
#
# Lê DOCKERHUB_USER e IMAGE_TAG (padrão v1) do .env.cloud. O frontend precisa de FRONTEND_BFF_URL,
# o endereço do BFF visto pelo navegador (o API Gateway na nuvem), gravado no build.
# Exige login prévio: docker login -u <usuário>
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
source "$root/infra/lib.sh"
load_env "$root/.env.cloud"
require_vars DOCKERHUB_USER

tag="${IMAGE_TAG:-v1}"
# A Function é publicada como código no Azure Functions (deploy.sh), não como imagem.
all=(identity catalog marketdata bff frontend)
services=("$@")
((${#services[@]})) || services=("${all[@]}")

for service in "${services[@]}"; do
  image="$DOCKERHUB_USER/puccrypto-$service"
  platforms="linux/amd64,linux/arm64"

  args=()
  if [[ "$service" == frontend ]]; then
    require_vars FRONTEND_BFF_URL
    args+=(--build-arg "VITE_BFF_URL=$FRONTEND_BFF_URL")
  fi

  step "$image:$tag ($platforms)"
  # Até três tentativas: os registros às vezes recusam a conexão por um instante (tempo esgotado no TLS).
  for attempt in 1 2 3; do
    if docker buildx build --platform "$platforms" ${args[@]+"${args[@]}"} \
      -t "$image:$tag" -t "$image:latest" --push "$root/$service"; then
      break
    fi
    ((attempt < 3)) || exit 1
    echo "Falha ao gerar ou publicar $image; nova tentativa em 10 s." >&2
    sleep 10
  done
done

step "Imagens publicadas em https://hub.docker.com/u/$DOCKERHUB_USER"
