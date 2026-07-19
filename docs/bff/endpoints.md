# BFF — endpoints

Base: `http://localhost:3002/api`

Espelha as operações de tasks via HTTP client (`API_BASE_URL`).

| Método | Endpoint | Descrição |
| ------ | -------- | --------- |
| `POST` | `/tasks` | Criar (proxy → API) |
| `GET` | `/tasks` | Listar (proxy → API) |
| `GET` | `/tasks/:id` | Buscar (proxy → API) |
| `PATCH` | `/tasks/:id` | Atualizar (proxy → API) |
| `DELETE` | `/tasks/:id` | Remover (proxy → API) |
| `GET` | `/health` | BFF + API (`ok` / `degraded`) |
| `GET` | `/metrics` | Métricas Prometheus |

## Health

O health do BFF consulta a API upstream. Se a API estiver indisponível, a resposta
pode vir como `degraded` (HTTP 503), sem derrubar o processo do BFF.

## Swagger

Em desenvolvimento: `http://localhost:3002/api/docs`

Em produção, o Swagger fica desligado por padrão.
