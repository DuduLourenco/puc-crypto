#!/usr/bin/env bash
# Provisiona o PucCrypto no Azure e implanta os serviços.
#
#   infra/azure/deploy.sh                # provisiona, publica as imagens e implanta
#   SKIP_IMAGES=1 infra/azure/deploy.sh  # implanta sem gerar as imagens de novo
#
# Recursos (todos no grupo AZURE_RESOURCE_GROUP):
#   Azure Container Apps   identity, catalog, marketdata, bff, frontend (imagens do Docker Hub)
#   Azure Functions        Function App no plano Flex Consumption (GetForecast e coleta agendada)
#   Azure SQL Database     catalog_db (Catalog) e identity_db (Identity), na oferta gratuita
#   Storage Account        exigido pelo Azure Functions
#   API Management         Gateway (Consumption), na frente do BFF
# Fora do Azure: MongoDB Atlas (MarketData) e CloudAMQP (RabbitMQ), informados no .env.cloud.
#
# O script pode ser executado de novo: reaproveita os recursos e os segredos gerados, que ficam em
# .env.cloud.secrets (fora do Git), e cria uma nova revisão de cada app.
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
source "$root/infra/lib.sh"
load_env "$root/.env.cloud"
require_vars DOCKERHUB_USER AZURE_LOCATION AZURE_RESOURCE_GROUP

# O SDK do .NET é necessário para publicar o código da Function.
if ! command -v dotnet >/dev/null; then
  [[ -x /opt/homebrew/opt/dotnet@8/bin/dotnet ]] && export PATH="/opt/homebrew/opt/dotnet@8/bin:$PATH"
fi
command -v dotnet >/dev/null || { echo "Instale o SDK do .NET 8 para publicar a Function." >&2; exit 1; }

# ---------- Segredos gerados ----------
secrets_file="$root/.env.cloud.secrets"
touch "$secrets_file"
chmod 600 "$secrets_file"
load_env "$secrets_file"

random_hex() { openssl rand -hex "$1"; }
# Gera o segredo apenas uma vez e o guarda para as próximas execuções.
ensure_secret() {
  local name="$1" value="${!1:-}"
  if [[ -z "$value" ]]; then
    value="$2"
    echo "$name=$value" >> "$secrets_file"
    export "$name=$value"
  fi
}
ensure_secret SUFFIX "$(random_hex 3)"
ensure_secret JWT_SIGNING_KEY "$(random_hex 32)"
# Senha com maiúsculas, minúsculas, números e símbolo, como exige o Azure SQL.
ensure_secret SQL_ADMIN_PASSWORD "Pc1-$(random_hex 12)"
ensure_secret COLLECTOR_API_KEY "$(random_hex 24)"
ensure_secret FORECAST_FUNCTION_KEY "$(random_hex 24)"

# ---------- Nomes ----------
rg="$AZURE_RESOURCE_GROUP"
location="$AZURE_LOCATION"
tag="${IMAGE_TAG:-v1}"
admin_user="puccryptoadmin"
env_name="cae-puccrypto"
# A região entra no nome do servidor de banco: uma tentativa que falha deixa o nome reservado
# naquela região, e outra região exige outro nome.
sql_server="sql-puccrypto-$SUFFIX-$location"
storage="stpuccrypto$SUFFIX"
function_app="func-puccrypto-$SUFFIX"
apim="apim-puccrypto-$SUFFIX"
gateway_url="https://$apim.azure-api.net/api"
function_url="https://$function_app.azurewebsites.net/api"

exists() { "$@" -o none &>/dev/null; }

# ---------- Preparação ----------
step "Assinatura: $(az account show --query name -o tsv)"
az extension add --name containerapp --upgrade --yes --only-show-errors
for provider in Microsoft.App Microsoft.OperationalInsights Microsoft.Web Microsoft.Sql \
  Microsoft.Storage Microsoft.ApiManagement; do
  az provider register --namespace "$provider" --wait -o none
done

step "Grupo de recursos $rg"
# O grupo é só um agrupador; se já existe em outra região, é reaproveitado.
exists az group show -n "$rg" || az group create -n "$rg" -l "$location" -o none

# O API Management demora alguns minutos para ficar pronto; a criação começa agora e é aguardada no fim.
if ! exists az apim show -g "$rg" -n "$apim"; then
  step "API Management $apim (em segundo plano)"
  az apim create -g "$rg" -n "$apim" -l "$location" --sku-name Consumption \
    --publisher-name "PucCrypto" --publisher-email "${APIM_PUBLISHER_EMAIL:-$(az account show --query user.name -o tsv)}" \
    --no-wait -o none
fi

# ---------- Bancos ----------
step "Azure SQL $sql_server: catalog_db e identity_db (oferta gratuita)"
if ! exists az sql server show -g "$rg" -n "$sql_server"; then
  az sql server create -g "$rg" -n "$sql_server" -l "$location" \
    --admin-user "$admin_user" --admin-password "$SQL_ADMIN_PASSWORD" -o none
fi
# 0.0.0.0 libera o acesso a partir de serviços do Azure, como o Container Apps.
az sql server firewall-rule create -g "$rg" -s "$sql_server" -n AllowAzureServices \
  --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0 -o none
# Um banco por serviço, no mesmo servidor; a oferta gratuita vale para até 10 bancos por assinatura.
for database in catalog_db identity_db; do
  if ! exists az sql db show -g "$rg" -s "$sql_server" -n "$database"; then
    az sql db create -g "$rg" -s "$sql_server" -n "$database" \
      --edition GeneralPurpose --family Gen5 --capacity 2 --compute-model Serverless \
      --use-free-limit --free-limit-exhaustion-behavior AutoPause \
      --backup-storage-redundancy Local -o none
  fi
done
sql_connection() {
  echo "Server=tcp:$sql_server.database.windows.net,1433;Database=$1;User ID=$admin_user;Password=$SQL_ADMIN_PASSWORD;Encrypt=True;TrustServerCertificate=False;Connection Timeout=60;"
}
catalog_db="$(sql_connection catalog_db)"
identity_db="$(sql_connection identity_db)"

# ---------- Container Apps ----------
step "Ambiente do Container Apps $env_name"
if ! exists az containerapp env show -g "$rg" -n "$env_name"; then
  az containerapp env create -g "$rg" -n "$env_name" -l "$location" -o none
fi
domain="$(az containerapp env show -g "$rg" -n "$env_name" --query properties.defaultDomain -o tsv)"
app_url() { echo "https://puccrypto-$1.$domain"; }

if [[ "${SKIP_IMAGES:-}" != 1 ]]; then
  step "Imagens no Docker Hub"
  FRONTEND_BFF_URL="$gateway_url" "$root/infra/publish-images.sh"
fi

# Cria ou atualiza um app. Usa os arrays SECRETS (nome=valor) e ENVS (NOME=valor ou NOME=secretref:nome).
# deploy_app <serviço> <porta> <réplicas mínimas>
deploy_app() {
  # A imagem é fixada pelo digest da tag: com a tag sozinha, o Container Apps pode reaproveitar
  # uma versão anterior que já tenha em cache.
  local app="puccrypto-$1" digest
  digest="$(docker buildx imagetools inspect "$DOCKERHUB_USER/puccrypto-$1:$tag" --format '{{json .Manifest.Digest}}' | tr -d '"')"
  local image="docker.io/$DOCKERHUB_USER/puccrypto-$1@$digest"
  step "Container App $app"
  if exists az containerapp show -g "$rg" -n "$app"; then
    if ((${#SECRETS[@]})); then
      az containerapp secret set -g "$rg" -n "$app" --secrets "${SECRETS[@]}" -o none
    fi
    # DEPLOYED_AT muda a cada execução e força uma revisão nova, para que a imagem seja baixada
    # de novo mesmo com a mesma tag (o ambiente express não aceita sufixo de revisão).
    az containerapp update -g "$rg" -n "$app" --image "$image" --cpu 0.25 --memory 0.5Gi \
      --min-replicas "$3" --max-replicas 2 \
      --replace-env-vars "${ENVS[@]}" "DEPLOYED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)" -o none
  else
    local secret_args=()
    ((${#SECRETS[@]})) && secret_args=(--secrets "${SECRETS[@]}")
    az containerapp create -g "$rg" -n "$app" --environment "$env_name" --image "$image" \
      --ingress external --target-port "$2" --cpu 0.25 --memory 0.5Gi \
      --min-replicas "$3" --max-replicas 2 ${secret_args[@]+"${secret_args[@]}"} \
      --env-vars "${ENVS[@]}" -o none
  fi
  app_url "$1"
}

SECRETS=("db=$identity_db" "jwt=$JWT_SIGNING_KEY")
ENVS=("ConnectionStrings__Database=secretref:db" "Jwt__SigningKey=secretref:jwt")
deploy_app identity 8080 0

# Daqui em diante, os serviços precisam do MongoDB Atlas e do CloudAMQP.
require_vars MONGODB_URI RABBITMQ_URI

# Catalog e MarketData consomem eventos do RabbitMQ, por isso ficam sempre com uma réplica.
SECRETS=("db=$catalog_db" "jwt=$JWT_SIGNING_KEY" "rabbitmq=$RABBITMQ_URI")
ENVS=("ConnectionStrings__Database=secretref:db" "Jwt__SigningKey=secretref:jwt" "RabbitMq__Uri=secretref:rabbitmq")
deploy_app catalog 8080 1

SECRETS=("db=$MONGODB_URI" "jwt=$JWT_SIGNING_KEY" "rabbitmq=$RABBITMQ_URI" "collector=$COLLECTOR_API_KEY")
ENVS=("ConnectionStrings__Database=secretref:db" "Jwt__SigningKey=secretref:jwt" "RabbitMq__Uri=secretref:rabbitmq"
  "Collector__ApiKey=secretref:collector")
if [[ -n "${COINGECKO_API_KEY:-}" ]]; then
  SECRETS+=("coingecko=$COINGECKO_API_KEY")
  ENVS+=("CoinGecko__ApiKey=secretref:coingecko")
fi
deploy_app marketdata 8080 1

# ---------- Azure Functions (Flex Consumption) ----------
step "Storage $storage e Function App $function_app (Flex Consumption)"
if ! exists az storage account show -g "$rg" -n "$storage"; then
  az storage account create -g "$rg" -n "$storage" -l "$location" --sku Standard_LRS --kind StorageV2 \
    --min-tls-version TLS1_2 --allow-blob-public-access false -o none
fi
if ! exists az functionapp show -g "$rg" -n "$function_app"; then
  az functionapp create -g "$rg" -n "$function_app" --storage-account "$storage" \
    --flexconsumption-location "$location" --runtime dotnet-isolated --runtime-version 8.0 -o none
fi
az functionapp config appsettings set -g "$rg" -n "$function_app" -o none --settings \
  "CollectPricesSchedule=${COLLECT_PRICES_SCHEDULE:-0 */30 * * * *}" \
  "MarketData__BaseUrl=$(app_url marketdata)/" \
  "MarketData__CollectorApiKey=$COLLECTOR_API_KEY"
# Chave conhecida de antemão, usada pelo BFF no cabeçalho x-functions-key.
az functionapp keys set -g "$rg" -n "$function_app" --key-type functionKeys --key-name default \
  --key-value "$FORECAST_FUNCTION_KEY" -o none

publish_dir="$(mktemp -d)"
trap 'rm -rf "$publish_dir"' EXIT
dotnet publish "$root/forecast-function/src/PucCrypto.Forecast.Api/PucCrypto.Forecast.Api.csproj" \
  -c Release -o "$publish_dir/out" --nologo -v quiet
(cd "$publish_dir/out" && zip -qr "$publish_dir/forecast.zip" .)
az functionapp deployment source config-zip -g "$rg" -n "$function_app" --src "$publish_dir/forecast.zip" -o none
echo "$function_url"

# ---------- BFF e frontend ----------
SECRETS=("jwt=$JWT_SIGNING_KEY" "forecast-key=$FORECAST_FUNCTION_KEY")
ENVS=("PORT=3000" "IDENTITY_URL=$(app_url identity)" "CATALOG_URL=$(app_url catalog)"
  "MARKETDATA_URL=$(app_url marketdata)" "FORECAST_URL=$function_url"
  "FORECAST_FUNCTION_KEY=secretref:forecast-key" "JWT_SIGNING_KEY=secretref:jwt"
  "CORS_ORIGINS=$(app_url frontend)")
deploy_app bff 3000 0

SECRETS=()
ENVS=("NGINX_ENTRYPOINT_QUIET_LOGS=1")
deploy_app frontend 80 0

# ---------- API Gateway ----------
step "Aguardando o API Management $apim"
az apim wait -g "$rg" -n "$apim" --created --timeout 3600 -o none
if ! exists az apim api show -g "$rg" --service-name "$apim" --api-id bff; then
  az apim api create -g "$rg" --service-name "$apim" --api-id bff --display-name "PucCrypto BFF" \
    --path api --service-url "$(app_url bff)" --protocols https --subscription-required false -o none
  # Todas as rotas e métodos seguem para o BFF; o CORS é respondido pelo próprio BFF.
  for method in GET POST PUT PATCH DELETE OPTIONS; do
    az apim api operation create -g "$rg" --service-name "$apim" --api-id bff \
      --operation-id "$(echo "$method" | tr '[:upper:]' '[:lower:]')-all" --display-name "$method /*" \
      --method "$method" --url-template "/*" -o none
  done
else
  az apim api update -g "$rg" --service-name "$apim" --api-id bff --service-url "$(app_url bff)" -o none
fi

step "Pronto"
cat <<EOF
Frontend:        $(app_url frontend)
API Gateway:     $gateway_url
BFF (Swagger):   $(app_url bff)/swagger
Identity:        $(app_url identity)/swagger
Catalog:         $(app_url catalog)/swagger
MarketData:      $(app_url marketdata)/swagger
Function:        $function_url/health
Docker Hub:      https://hub.docker.com/u/$DOCKERHUB_USER
EOF
