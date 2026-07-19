# API — endpoints

Base: `http://localhost:3001/api`

| Método | Endpoint | Descrição |
| ------ | -------- | --------- |
| `POST` | `/tasks` | Criar tarefa |
| `GET` | `/tasks` | Listar (`page`, `limit`, `status`, `search`) |
| `GET` | `/tasks/:id` | Buscar por ID |
| `PATCH` | `/tasks/:id` | Atualizar |
| `DELETE` | `/tasks/:id` | Remover |
| `GET` | `/health` | Saúde da app + banco (`ok` / `degraded`) |
| `GET` | `/metrics` | Métricas Prometheus |

## Query params da listagem

| Param | Tipo | Descrição |
| ----- | ---- | --------- |
| `page` | number | Página (default típico: 1) |
| `limit` | number | Itens por página |
| `status` | enum | `PENDING` \| `IN_PROGRESS` \| `COMPLETED` |
| `search` | string | Busca em título/descrição |

## Modelo

```text
Task
├── id            UUID
├── title         string (3–120)
├── description   string? (até 500)
├── status        PENDING | IN_PROGRESS | COMPLETED
├── createdAt     DateTime
└── updatedAt     DateTime
```

## Swagger

Em desenvolvimento: `http://localhost:3001/api/docs`

Em produção (`NODE_ENV=production`), o Swagger fica desligado por padrão.
