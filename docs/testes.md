# Testes

## API

```bash
cd api
npm run test:all   # unit (100%) + integração + e2e
```

| Tipo | O que cobre |
| ---- | ----------- |
| Unitário | Service, repository, filter, DTOs, bootstrap, health, metrics, Sentry |
| Integração | Service + repository + Postgres real |
| E2E | Fluxo HTTP completo (`/api/tasks`, health, validação, Swagger) |

## BFF

```bash
cd bff
npm run test:all   # unit (100%) + integração + e2e
```

| Tipo | O que cobre |
| ---- | ----------- |
| Unitário | Service, controller, filter, `throwApiError`, DTOs, bootstrap, health |
| Integração | Service + HttpClient com API mockada (nock) |
| E2E | Fluxo HTTP completo do BFF (API mockada via nock) |

## Frontend

```bash
cd frontend
npm run test:all   # unitários com coverage 100%
```

| Tipo | O que cobre |
| ---- | ----------- |
| Unitário | Componentes, hooks (`useTaskBoard` / `use-tasks`), `tasks-api`, libs, Sentry |

Não há camada integração/e2e no frontend (UI testada com Testing Library + mocks do BFF). O fluxo HTTP real fica coberto pelo e2e da API e do BFF.

## Critérios

- Unitários com **coverageThreshold 100%** nos três pacotes
- Integração e e2e (API/BFF) validam comportamento real / mock HTTP
- Preferir `npm run test:all` em cada pacote (ou `npm test` na raiz para unitários) antes de abrir PR
