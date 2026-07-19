# Começar

## Requisitos

- Node.js 20+
- npm
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

## 3) Frontend

A pasta `front/` ainda está reservada. Quando existir, deve consumir o **BFF**
(`FRONTEND_ORIGIN` / porta `5173`), nunca a API diretamente.

## Documentação local (MkDocs)

Na raiz do monorepo:

```bash
pip install -r requirements-docs.txt
mkdocs serve
```

Abra [`http://127.0.0.1:8000`](http://127.0.0.1:8000).

Para gerar o site estático:

```bash
mkdocs build
```

## Ordem recomendada

1. Subir PostgreSQL e criar o banco
2. Subir a API
3. Subir o BFF
4. (futuro) Subir o frontend apontando para o BFF
