#!/usr/bin/env bash
# Cria ou atualiza o PR HEAD → develop (idempotente).
# Uso: create-or-update-dev-pr.sh <head-branch>
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

PR_NUMBER="$(gh pr list --repo "$REPO" --state open --base "$BASE" --head "$HEAD" --json number --jq '.[0].number // empty')"

if [ -n "$PR_NUMBER" ]; then
  gh pr edit "$PR_NUMBER" --repo "$REPO" --title "$TITLE" --body "$BODY"
  echo "PR #$PR_NUMBER atualizado: https://github.com/${REPO}/pull/${PR_NUMBER}"
  exit 0
fi

URL="$(gh pr create --repo "$REPO" --base "$BASE" --head "$HEAD" --title "$TITLE" --body "$BODY")"
echo "PR criado: $URL"
