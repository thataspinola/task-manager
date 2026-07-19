# Frontend

Pasta `front/` reservada para a UI React.

## Planejado

| Item | Expectativa |
| ---- | ----------- |
| Stack | React + Vite |
| Porta | `5173` |
| Backend | **somente o BFF** (`http://localhost:3002/api`) |
| CORS | `FRONTEND_ORIGIN` / `CORS_ORIGIN` já apontam para `5173` |

## Regra de ouro

```text
Browser  →  BFF  →  API  →  Postgres
         ✗
Browser  ───────→  API   (não fazer)
```

Quando o frontend for adicionado, esta seção será expandida com setup, rotas e
contratos de UI.
