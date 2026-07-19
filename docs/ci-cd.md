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
| `docs.yml` | `docs/**`, `mkdocs.yml`, scripts de docs |

Exemplos:

- Push só em `api/src/...` → roda **API Validate** (não BFF, não Docs)
- Push só em `docs/` → roda **Docs**
- Push em `api/` e `bff/` no mesmo commit → roda API e BFF

## Documentação (MkDocs + Pages)

Workflow: `.github/workflows/docs.yml`

1. Gera log do push em `docs/historico/entries/`
2. Atualiza `docs/historico/index.md`
3. Commit automático com `[skip ci]`
4. Build MkDocs
5. Em **`main`**, publica no GitHub Pages

### Ativar GitHub Pages (uma vez)

1. **Settings → Pages**
2. **Source:** GitHub Actions
3. Push/merge em `main`

URL: `https://thataspinola.github.io/task-manager/`

## API e BFF (raiz)

| Workflow | Função |
| -------- | ------ |
| `api-validate` / `bff-validate` | Lint, build, testes em `feature/**` e `fix/**` |
| `api-deploy-dev` / `bff-deploy-dev` | Após merge em `develop` |
| `api-deploy-hom` / `bff-deploy-hom` | Push em `release/**` |
| `api-deploy-prod` / `bff-deploy-prod` | Push em `main` |

Os jobs usam `working-directory: api` ou `bff` para `npm ci` / lint / test.

## Histórico automático

Script: `scripts/generate_push_log.py` — commits, autor e arquivos do push.
