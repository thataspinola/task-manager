# Task Manager

Monorepo de um gerenciador de tarefas com arquitetura em camadas:

```text
React (front)  →  NestJS BFF (bff)  →  NestJS API (api)  →  PostgreSQL
```

O frontend **não** fala com a API diretamente. O BFF adapta contratos, agrega chamadas e isola o browser da API de domínio.

## Status atual

| Pacote | Status |
| ------ | ------ |
| [API](api/index.md) | CRUD, health, metrics, Swagger, Sentry opcional, testes |
| [BFF](bff/index.md) | Proxy HTTP, health, metrics, Swagger, Sentry opcional, testes |
| [Frontend](front/index.md) | React + Vite, testes 100%, Sentry opcional, CI validate |
| Observabilidade | SonarQube Community + Prometheus + Grafana + Alertmanager |

## Navegação rápida

| Seção | Conteúdo |
| ----- | -------- |
| [Arquitetura](arquitetura.md) | Fluxos e responsabilidades |
| [Começar](comecar.md) | Subir API, BFF, frontend, banco e stack de obs |
| [Testes](testes.md) | Unitários, integração e e2e |
| [CI/CD](ci-cd.md) | Workflows, Sonar e GitHub Pages |
| [Observabilidade](observabilidade.md) | Métricas, alarmes, Sentry, Sonar |
| [Histórico de pushes](historico/index.md) | Log automático de cada push |

## Portas locais

| Serviço | Porta | Base / UI |
| ------- | ----- | --------- |
| API | `3001` | `/api` · metrics `/api/metrics` |
| BFF | `3002` | `/api` · metrics `/api/metrics` |
| Frontend | `5173` | Vite dev · preview `4173` |
| SonarQube | `9000` | UI |
| Prometheus | `9090` | UI |
| Grafana | `3000` | UI (`admin` / `admin`) |
| Alertmanager | `9093` | UI |

!!! tip "Swagger"
    Em desenvolvimento, a documentação OpenAPI fica em `/api/docs` na API e no BFF.
    Em `NODE_ENV=production`, o Swagger fica desligado por padrão.

!!! info "Este site"
    Publicado via GitHub Pages a partir da pasta `docs/` (workflow `docs.yml` em `main`).
