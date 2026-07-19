# Testes

## API

```bash
cd api
npm run test:all   # unit (100%) + integração + e2e
```

| Tipo | O que cobre |
| ---- | ----------- |
| Unitário | Service, repository, filter, DTOs, bootstrap, health |
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
| E2E | Fluxo HTTP completo do BFF |

## Critérios

- Unitários com **coverageThreshold 100%** nos pacotes configurados
- Integração e e2e validam o comportamento real (ou mock HTTP no BFF)
- Preferir `npm run test:all` antes de abrir PR
