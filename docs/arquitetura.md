# Arquitetura

## Visão do sistema

```text
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌────────────┐
│  React UI   │────▶│  NestJS BFF  │────▶│  NestJS API  │────▶│ PostgreSQL │
│  (front)    │     │  :3002       │     │  :3001/api   │     │            │
└─────────────┘     └──────────────┘     └──────────────┘     └────────────┘
```

## Por que BFF?

- O browser não precisa conhecer detalhes internos da API
- Facilita CORS, agregação e adaptação de payload para a UI
- Permite evoluir a API sem quebrar o frontend de uma vez

## Responsabilidades

| Responsabilidade | BFF | API |
| ---------------- | --- | --- |
| Validar payload do front | sim | sim (defesa em profundidade) |
| Regras de domínio / CRUD | não | sim |
| Persistência (Prisma/Postgres) | não | sim |
| Proxy HTTP tipado | sim | não |
| Traduzir erros da API para o front | sim | — |
| Métricas Prometheus `/api/metrics` | sim | sim |
| Sentry (erros 5xx) | sim (opcional) | sim (opcional) |

## Fluxo interno da API

```text
Controller (HTTP)
   → DTO + ValidationPipe
   → Service (regras)
   → Repository (DIP)
   → PrismaService
   → PostgreSQL
```

## Fluxo interno do BFF

```text
Controller (HTTP)
   → DTO + ValidationPipe
   → Service (proxy / gateway)
   → HttpService (Axios)
   → API interna
         ↓ (em erro)
   throwApiError (adapter Axios → Nest)
```

## Estrutura do repositório

```text
task-manager/
├── api/                 # API de domínio (NestJS + Prisma)
│   ├── src/metrics/     # Prometheus
│   ├── src/observability/
│   └── sonar-project.properties
├── bff/                 # Backend for Frontend
│   ├── src/metrics/
│   ├── src/observability/
│   └── sonar-project.properties
├── front/               # Frontend (reservado)
├── observability/       # Sonar + Prometheus + Grafana + Alertmanager
├── docs/                # MkDocs → GitHub Pages
├── .github/workflows/   # CI na raiz (paths por pacote)
└── mkdocs.yml
```

## Modelo de domínio

```text
Task
├── id            UUID
├── title         string (3–120)
├── description   string? (até 500)
├── status        PENDING | IN_PROGRESS | COMPLETED
├── createdAt     DateTime
└── updatedAt     DateTime
```

Status no banco como **enum** para garantir valores válidos.

## Design patterns

| Padrão | API | BFF |
| ------ | --- | --- |
| **Repository** | `TasksRepository` + Prisma | — |
| **BFF / Proxy** | — | `TasksService` |
| **Adapter** | Prisma / `PrismaPg` | `throwApiError` |
| **DTO** | sim | sim |
| **DI + Module** | Nest feature modules | Nest feature modules |
| **Exception Filter** | `AllExceptionsFilter` | `AllExceptionsFilter` |
| **Factory** | `create-app` | `create-app` |

## SOLID (visão prática)

| Princípio | Como aparece |
| --------- | ------------ |
| **S** | Controller fino; service com regras/proxy; repository com queries |
| **O** | Novos filtros/status sem reescrever o CRUD |
| **L** | Implementações substituíveis por mock/contrato |
| **I** | Contrato de tasks só com operações de task |
| **D** | API: service → `TASKS_REPOSITORY`; BFF: DI do Nest |
