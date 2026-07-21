#!/usr/bin/env bash
# Cria ou atualiza o PR HEAD → develop (idempotente).
# Uso: create-or-update-dev-pr.sh <head-branch>
#
# Tokens (nessa ordem, se definidos):
#   1) ACTIONS_PR_TOKEN  → normalmente ${{ github.token }}
#   2) AUTOMATION_TOKEN  → PAT/App secret do repositório
#   3) GH_TOKEN          → fallback único
set -euo pipefail

HEAD="${1:-}"
BASE="develop"
REPO="${GITHUB_REPOSITORY:-}"

if [ -z "$HEAD" ]; then
  echo "::error::Informe a branch head (ex.: feature/api)."
  exit 1
fi

if [ -z "$REPO" ]; then
  echo "::error::GITHUB_REPOSITORY não definido."
  exit 1
fi

case "$HEAD" in
  feature/*) TITLE="feature/${HEAD#feature/} → develop" ;;
  fix/*) TITLE="fix/${HEAD#fix/} → develop" ;;
  *)
    echo "::notice::Branch '$HEAD' não é feature/* nem fix/*; PR não será criado."
    exit 0
    ;;
esac

BODY="PR automático criado após validação do monorepo com sucesso."

print_permission_help() {
  echo "::notice::Opção A (recomendada): Settings → Actions → General → Workflow permissions"
  echo "::notice::  - Read and write permissions"
  echo "::notice::  - Marque 'Allow GitHub Actions to create and approve pull requests'"
  echo "::notice::Opção B: secret AUTOMATION_TOKEN com permissão de Pull requests"
  echo "::notice::  - PAT clássico: escopo 'repo'"
  echo "::notice::  - PAT fine-grained: Pull requests Read and write + Contents Read no repo"
  echo "::notice::  - Se a org usa SSO: Authorize o PAT para a organização"
  echo "::notice::Abra manualmente: https://github.com/${REPO}/compare/${BASE}...${HEAD}?expand=1"
}

if ! git ls-remote --exit-code --heads origin "$BASE" >/dev/null 2>&1; then
  echo "::notice::Branch base '$BASE' não existe no remoto; PR não será criado."
  exit 0
fi

if ! git ls-remote --exit-code --heads origin "$HEAD" >/dev/null 2>&1; then
  echo "::notice::Branch head '$HEAD' não existe no remoto; PR não será criado."
  exit 0
fi

git fetch origin "$BASE" "$HEAD"

AHEAD="$(git rev-list --count "origin/$BASE..origin/$HEAD")"
echo "Commits em ${HEAD} à frente de ${BASE}: ${AHEAD}"

if [ "$AHEAD" -eq 0 ]; then
  echo "::notice::Não há commits únicos em ${HEAD} relativamente a ${BASE}; PR não será criado/atualizado."
  exit 0
fi

TOKENS=()
TOKEN_LABELS=()

add_token() {
  local value="${1:-}"
  local label="${2:-token}"
  if [ -z "$value" ]; then
    return 0
  fi
  local existing
  for existing in "${TOKENS[@]+"${TOKENS[@]}"}"; do
    if [ "$existing" = "$value" ]; then
      return 0
    fi
  done
  TOKENS+=("$value")
  TOKEN_LABELS+=("$label")
}

# Preferir GITHUB_TOKEN (Actions) — funciona com a checkbox do repositório.
# AUTOMATION_TOKEN depois — muitos PATs de deploy não têm createPullRequest.
add_token "${ACTIONS_PR_TOKEN:-}" "github.token (Actions)"
add_token "${AUTOMATION_TOKEN:-}" "AUTOMATION_TOKEN (PAT)"
add_token "${GH_TOKEN:-}" "GH_TOKEN"

if [ "${#TOKENS[@]}" -eq 0 ]; then
  echo "::error::Nenhum token disponível para criar o PR."
  print_permission_help
  exit 1
fi

LAST_ERR=""

for i in "${!TOKENS[@]}"; do
  export GH_TOKEN="${TOKENS[$i]}"
  LABEL="${TOKEN_LABELS[$i]}"
  echo "Tentando com ${LABEL}..."

  PR_NUMBER="$(gh pr list --repo "$REPO" --state open --base "$BASE" --head "$HEAD" --json number --jq '.[0].number // empty' 2>/dev/null || true)"

  if [ -n "$PR_NUMBER" ]; then
    if OUT="$(gh pr edit "$PR_NUMBER" --repo "$REPO" --title "$TITLE" --body "$BODY" 2>&1)"; then
      echo "PR #$PR_NUMBER atualizado com ${LABEL}: https://github.com/${REPO}/pull/${PR_NUMBER}"
      exit 0
    fi
    LAST_ERR="$OUT"
    echo "::warning::Falha ao atualizar PR com ${LABEL}: ${OUT}"
    continue
  fi

  if OUT="$(gh pr create --repo "$REPO" --base "$BASE" --head "$HEAD" --title "$TITLE" --body "$BODY" 2>&1)"; then
    echo "PR criado com ${LABEL}: ${OUT}"
    exit 0
  fi
  LAST_ERR="$OUT"
  echo "::warning::Falha ao criar PR com ${LABEL}: ${OUT}"
done

echo "::error::Não foi possível criar/atualizar o PR com nenhum token disponível."
echo "::error::Último erro: ${LAST_ERR}"
print_permission_help
exit 1
