# CI/CD

## Onde ficam os workflows

O GitHub Actions **só** lê arquivos em:

```text
.github/workflows/   ← raiz do monorepo
```

Não funciona colocar workflows em `api/.github/` ou `bff/.github/`.

## Quando cada pipeline roda

Filtro por `paths`: o workflow só dispara se o push/PR alterou arquivos daquele pacote.

| Workflow | Dispara quando muda |
| -------- | ------------------- |
| `api-validate.yml` | `api/**` |
| `api-deploy-*.yml` | `api/**` |
| `bff-validate.yml` | `bff/**` |
| `bff-deploy-*.yml` | `bff/**` |
| `frontend-validate.yml` | `frontend/**` |
| `docs.yml` | `docs/**`, `mkdocs.yml`, scripts de docs |

Exemplos:

- Push só em `api/src/...` → roda **API Validate** (não BFF, não Frontend, não Docs)
- Push só em `frontend/` → roda **Frontend Validate**
- Push só em `docs/` → roda **Docs**
- Push em `api/` e `bff/` no mesmo commit → roda API e BFF

## Documentação (MkDocs + Pages)

Workflow: `.github/workflows/docs.yml`

A cada push relevante (paths de docs):

1. Gera log do push em `docs/historico/entries/`
2. Atualiza `docs/historico/index.md`
3. Commit automático com `[skip ci]`
4. Build MkDocs (`mkdocs build --strict`)
5. Em **`main`**, publica no **GitHub Pages**

### Conteúdo do site

- Arquitetura, setup, API, BFF, testes
- [CI/CD](ci-cd.md) e [Observabilidade](observabilidade.md)
- Histórico automático de pushes

### Ativar GitHub Pages (uma vez)

1. **Settings → Pages**
2. **Source:** GitHub Actions
3. Push/merge em `main`

URL: `https://thataspinola.github.io/task-manager/`

Pré-visualizar localmente:

```bash
pip install -r requirements-docs.txt
python -m mkdocs serve
```

Actions do workflow de Docs atualizadas para runtime **Node.js 24** (`checkout@v5`, `setup-python@v6`, `git-auto-commit-action@v7`, Pages `@v5`).

## API, BFF e Frontend (raiz)

| Workflow | Função |
| -------- | ------ |
| `api-validate` / `bff-validate` / `frontend-validate` | Lint, build, testes em `feature/**` e `fix/**` |
| `api-deploy-dev` / `bff-deploy-dev` | Após merge em `develop` |
| `api-deploy-hom` / `bff-deploy-hom` | Push em `release/**` |
| `api-deploy-prod` / `bff-deploy-prod` | Push em `main` |

Os jobs usam `working-directory: api`, `bff` ou `frontend` para `npm ci` / lint / test.

### SonarQube (validate)

Após os testes, `api-validate` / `bff-validate` / `frontend-validate` rodam scan no SonarQube Community se existirem os secrets:

- `SONAR_HOST_URL`
- `SONAR_TOKEN`

Sem secrets, o job Sonar é skipped. Detalhes em [Observabilidade](observabilidade.md).

## Histórico automático

Script: `scripts/generate_push_log.py` — commits, autor e arquivos do push.
