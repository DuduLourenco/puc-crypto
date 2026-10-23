# Funções comuns aos scripts de publicação e deploy. Uso: source infra/lib.sh

# Carrega um arquivo KEY=VALUE sem executá-lo, para que valores com &, ? ou $ (ex.: URIs) fiquem intactos.
load_env() {
  local file="$1" line key value
  [[ -f "$file" ]] || { echo "Arquivo $file não encontrado." >&2; return 1; }
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*(#|$) ]] && continue
    key="${line%%=*}"
    value="${line#*=}"
    value="${value%$'\r'}"
    # Remove aspas envolventes, se houver.
    if [[ "$value" =~ ^\"(.*)\"$ || "$value" =~ ^\'(.*)\'$ ]]; then value="${BASH_REMATCH[1]}"; fi
    export "$key=$value"
  done < "$file"
}

# Falha com uma mensagem clara se alguma das variáveis estiver vazia.
require_vars() {
  local name missing=()
  for name in "$@"; do [[ -n "${!name:-}" ]] || missing+=("$name"); done
  if ((${#missing[@]})); then
    echo "Preencha no .env.cloud: ${missing[*]}" >&2
    exit 1
  fi
}

step() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
