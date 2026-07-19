# API — visão geral

API REST de domínio para gerenciamento de tarefas: NestJS, Prisma ORM e PostgreSQL.

```text
Controller → DTO → Service → Repository (DIP) → Prisma → PostgreSQL
```

O frontend **não** deve acessar esta API diretamente — use o [BFF](../bff/index.md).

## Stack

| Biblioteca | Papel |
| ---------- | ----- |
| NestJS | Framework HTTP modular, DI, pipes/filters |
| Prisma + `@prisma/adapter-pg` | ORM e migrations (Prisma 7) |
| PostgreSQL | Persistência |
| Joi | Validação de variáveis de ambiente |
| class-validator | Validação de DTOs |
| Swagger | OpenAPI em `/api/docs` |
| Jest + SWC | Testes |
| Prometheus (`nestjs-prometheus`) | `/api/metrics` |
| Sentry | Erros 5xx (opcional via `SENTRY_DSN`) |

## Funcionalidades

- CRUD de tarefas
- Filtro por status e busca por título/descrição
- Paginação
- Health check (app + banco: `ok` / `degraded`)
- Métricas Prometheus
- Tratamento global de erros (+ Sentry opcional)
- Seed do banco
- Cobertura unitária 100% + integração + e2e
- Scan SonarQube no CI (`sonar-project.properties`)

## Estrutura

```text
api/
├── prisma/          # schema, migrations, seed
├── src/
│   ├── bootstrap/   # create-app
│   ├── common/      # Prisma + AllExceptionsFilter
│   ├── config/      # env Joi
│   ├── health/
│   ├── metrics/     # Prometheus
│   ├── observability/  # Sentry
│   ├── tasks/
│   └── generated/
├── sonar-project.properties
└── test/
```

## Como rodar

Veja [Começar](../comecar.md#1-api-porta-3001). Detalhes extras no `api/README.md` do repositório.

## Testes

```bash
cd api
npm run test:all
```
