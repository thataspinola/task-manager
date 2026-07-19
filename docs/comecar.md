# Começar

## Requisitos

- Node.js 20+
- npm
- Docker Desktop (para `npm run start:dev` com observabilidade)
- PostgreSQL com banco `task_manager`
- (opcional) Python 3.12+ para pré-visualizar a documentação MkDocs

## 1) API (porta `3001`)

```bash
cd api
npm install
cp .env.example .env
```

No PostgreSQL:

```sql
CREATE DATABASE task_manager;
```

Variáveis mínimas:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/task_manager?schema=public"
CORS_ORIGIN=http://localhost:5173
```

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

| Recurso | URL |
| ------- | --- |
| API | `http://localhost:3001/api` |
| Swagger | `http://localhost:3001/api/docs` |
| Health | `http://localhost:3001/api/health` |
| Metrics | `http://localhost:3001/api/metrics` |

## 2) BFF (porta `3002`)

Com a API já rodando:

```bash
cd bff
npm install
cp .env.example .env
```

```env
NODE_ENV=development
PORT=3002
API_BASE_URL=http://localhost:3001/api
FRONTEND_ORIGIN=http://localhost:5173
HTTP_TIMEOUT=5000
```

```bash
npm run start:dev
```

| Recurso | URL |
| ------- | --- |
| BFF | `http://localhost:3002/api` |
| Swagger | `http://localhost:3002/api/docs` |
| Health | `http://localhost:3002/api/health` |
| Metrics | `http://localhost:3002/api/metrics` |

## 3) Tudo de uma vez (raiz do monorepo)

Com PostgreSQL no ar, `.env` da API/BFF prontos e Docker Desktop rodando:

```bash
# na raiz
npm install
npm run start:dev
```

Isso sobe **SonarQube + Prometheus + Grafana + Alertmanager** (`obs:up`) e, em seguida, **API + BFF** em paralelo.

| Script | O que faz |
| ------ | --------- |
| `npm run start:dev` | Observabilidade + API + BFF |
| `npm run start:apps` | Só API + BFF (sem Docker) |
| `npm run obs:up` / `obs:down` | Liga/desliga a stack Docker |
| `npm run obs:logs` | Logs da stack |

| Serviço | URL |
| ------- | --- |
| API | `http://localhost:3001/api` |
| BFF | `http://localhost:3002/api` |
| SonarQube | `http://localhost:9000` (`admin` / `admin`) |
| Prometheus | `http://localhost:9090` |
| Grafana | `http://localhost:3000` (`admin` / `admin`) |
| Alertmanager | `http://localhost:9093` |

SonarQube pode levar 1–2 min na primeira subida.

### Sentry + Sonar (tokens no `.env`)

**Sentry** — em [sentry.io](https://sentry.io) crie um projeto Node.js, copie o DSN e cole em `api/.env` e `bff/.env` (`SENTRY_DSN=...`). Reinicie as apps.

**Sonar** — com a stack no ar (`http://localhost:9000`):

```bash
cp .env.example .env
# edite SONAR_TOKEN=... (My Account → Security → Generate Tokens)
npm run sonar:all
```

Detalhes: [Observabilidade](observabilidade.md).

## 4) Frontend

A pasta `front/` ainda está reservada. Quando existir, deve consumir o **BFF**
(`FRONTEND_ORIGIN` / porta `5173`), nunca a API diretamente.

## Documentação local (MkDocs)

Na raiz do monorepo:

```bash
pip install -r requirements-docs.txt
python -m mkdocs serve
```

Abra [`http://127.0.0.1:8000`](http://127.0.0.1:8000).

Para gerar o site estático (o mesmo artefato do GitHub Pages):

```bash
python -m mkdocs build
```

## Ordem recomendada

1. Subir PostgreSQL e criar o banco; configurar `.env` da API/BFF
2. Na raiz: `npm install` e `npm run start:dev`
3. (opcional) `SENTRY_DSN` no `.env` + scan Sonar com `SONAR_TOKEN`
4. (futuro) Frontend apontando para o BFF
