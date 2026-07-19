# Observabilidade

Stack gratuita combinada: **SonarQube Community** (qualidade), **Prometheus + Grafana + Alertmanager** (métricas/alarmes) e **Sentry** (erros).

## Modo local completo (recomendado)

Na raiz do monorepo, com Docker Desktop, PostgreSQL e `.env` da API/BFF:

```bash
npm install
npm run start:dev
```

Sobe a stack Docker e, em seguida, API (`3001`) + BFF (`3002`) juntos.

| Script (raiz) | O que faz |
| ------------- | --------- |
| `npm run start:dev` | Observabilidade + API + BFF |
| `npm run start:apps` | Só API + BFF |
| `npm run obs:up` | Só Docker (Sonar, Prometheus, Grafana, Alertmanager) |
| `npm run obs:down` | Para a stack Docker |
| `npm run obs:logs` | Logs da stack |

| Serviço | URL |
| ------- | --- |
| SonarQube | `http://localhost:9000` (login inicial `admin` / `admin` — troque a senha) |
| Prometheus | `http://localhost:9090` |
| Grafana | `http://localhost:3000` (`admin` / `admin`) |
| Alertmanager | `http://localhost:9093` |

Com as apps rodando, o Prometheus raspa:

- `http://host.docker.internal:3001/api/metrics`
- `http://host.docker.internal:3002/api/metrics`

SonarQube pode levar 1–2 minutos na primeira subida.

## Métricas nas apps

API e BFF expõem:

- `GET /api/metrics` — formato Prometheus
- Gauge `app_health_status{service,component}` atualizado pelo `/api/health`
- Histogram `http_requests_seconds` (latência/status)

## Alarmes (Alertmanager)

Regras em `observability/prometheus/alerts.yml`:

- target down
- taxa de 5xx > 5%
- latência p95 > 1s
- health degradado (`app_health_status == 0`)

Para receber alarmes, edite `observability/alertmanager/alertmanager.yml` e troque a URL do webhook (Slack Incoming Webhook, Discord, etc.). Há um exemplo em `observability/.env.example`.

## Sentry (local)

1. Crie conta free: [sentry.io/signup](https://sentry.io/signup/)
2. Projetos **Node.js** (API/BFF) e **React** (frontend)
3. Copie os **DSN**
4. Cole em `api/.env` e `bff/.env`:

   ```env
   SENTRY_DSN=https://xxxx@o0.ingest.sentry.io/yyyy
   SENTRY_TRACES_SAMPLE_RATE=0.1
   ```

5. No frontend (`.env`):

   ```env
   VITE_SENTRY_DSN=https://xxxx@o0.ingest.sentry.io/yyyy
   VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
   ```

6. Reinicie as apps

Sem DSN, o Sentry fica desligado. Com DSN, erros 5xx (API/BFF) vão pelo `AllExceptionsFilter`; no browser, `@sentry/react` captura exceções do cliente.

## SonarQube — scan local via `.env`

1. `npm run obs:up` (ou `start:dev`) e abra `http://localhost:9000`
2. Login `admin` / `admin`, troque a senha
3. Avatar → **My Account** → **Security** → **Generate Tokens** → nome `local`
4. Na raiz do monorepo (já existe `.env` a partir do example):

   ```bash
   # edite .env na raiz:
   SONAR_TOKEN=seu_token_aqui
   ```

5. Rode (gera coverage + scan):

   ```bash
   npm run sonar:all
   # ou: npm run sonar:api / npm run sonar:bff / npm run sonar:frontend
   ```

Os scripts leem `SONAR_TOKEN` e `SONAR_HOST_URL` do `.env` da raiz.

## SonarQube no CI

1. Sonar acessível pelos runners do GitHub (VPS/túnel — **não** use `localhost`)
2. Secrets: `SONAR_HOST_URL` (ex. `https://sonar.seudominio.com`), `SONAR_TOKEN`

Sem secrets, ou se `SONAR_HOST_URL` for `localhost`/`127.0.0.1`, o job Sonar é **skipped** e o restante do pipeline segue. Porta correta do Sonar local é `9000` (não `9090`, que é Prometheus).
