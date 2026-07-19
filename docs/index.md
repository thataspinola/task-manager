# Task Manager

Monorepo de um gerenciador de tarefas com arquitetura em camadas:

```text
React (front)  →  NestJS BFF (bff)  →  NestJS API (api)  →  PostgreSQL
```

O frontend **não** fala com a API diretamente. O BFF adapta contratos, agrega chamadas e isola o browser da API de domínio.

## Status atual

| Pacote | Status |
| ------ | ------ |
| [API](api/index.md) | Pronto: CRUD, paginação, filtros, health, Swagger, testes |
| [BFF](bff/index.md) | Pronto: proxy HTTP de tasks + health + Swagger + testes |
| [Frontend](front/index.md) | Pasta reservada (Vite/React previsto na porta `5173`) |

## Navegação rápida

| Seção | Conteúdo |
| ----- | -------- |
| [Arquitetura](arquitetura.md) | Fluxos, responsabilidades e diagramas |
| [Começar](comecar.md) | Como subir API, BFF e banco localmente |
| [Testes](testes.md) | Unitários, integração e e2e |
| [CI/CD](ci-cd.md) | Workflows de validação e documentação |
| [Histórico de pushes](historico/index.md) | Log automático de cada push no GitHub |

## Portas locais

| Serviço | Porta | Base |
| ------- | ----- | ---- |
| API | `3001` | `/api` |
| BFF | `3002` | `/api` |
| Frontend (previsto) | `5173` | — |

!!! tip "Swagger"
    Em desenvolvimento, a documentação OpenAPI fica em `/api/docs` na API e no BFF.
    Em `NODE_ENV=production`, o Swagger fica desligado por padrão.
