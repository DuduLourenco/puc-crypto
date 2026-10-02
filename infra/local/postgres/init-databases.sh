#!/bin/bash
# Executado pelo PostgreSQL apenas na primeira inicialização do volume.
# Cria um banco e um usuário por serviço (Database per Service): cada usuário
# é dono do seu banco e não consegue conectar nos demais.
set -euo pipefail

create_service_database() {
  local database="$1" user="$2" password="$3"

  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres \
    -v database="$database" -v user="$user" -v password="$password" <<'EOSQL'
CREATE ROLE :"user" LOGIN PASSWORD :'password';
CREATE DATABASE :"database" OWNER :"user";
REVOKE ALL ON DATABASE :"database" FROM PUBLIC;
EOSQL
}

create_service_database identity_db   identity_user   "$IDENTITY_DB_PASSWORD"
create_service_database catalog_db    catalog_user    "$CATALOG_DB_PASSWORD"
create_service_database marketdata_db marketdata_user "$MARKETDATA_DB_PASSWORD"
create_service_database prediction_db prediction_user "$PREDICTION_DB_PASSWORD"
