# Task Manager

Monorepo de um gerenciador de tarefas com arquitetura em camadas:

```text
React (front)  →  NestJS BFF (bff)  →  NestJS API (api)  →  PostgreSQL
```

O frontend **não** fala com a API diretamente. O BFF adapta contratos, agrega chamadas e isola o browser da API de domínio.

---

## Índice

1. [Visão geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura do repositório](#estrutura-do-repositório)
4. [Stack e bibliotecas (por quê)](#stack-e-bibliotecas-por-quê)
5. [Modelo de domínio](#modelo-de-domínio)
6. [Como subir o projeto](#como-subir-o-projeto)
7. [Endpoints](#endpoints)
8. [Princípios de código](#princípios-de-código)
9. [Testes](#testes)
10. [Decisões técnicas](#decisões-técnicas)
11. [Documentação por pacote](#documentação-por-pacote)

---

## Visão geral

| Camada | Pasta | Responsabilidade |
| ------ | ----- | ---------------- |
| **Frontend** | `front/` | UI React (em construção) |
| **BFF** | `bff/` | Proxy tipado para a API; contratos pensados para o front |
| **API** | `api/` | Regras de negócio, CRUD, persistência, Swagger |
| **Banco** | PostgreSQL | Fonte da verdade dos dados |

### Status atual

| Pacote | Status |
| ------ | ------ |
| [api](./api) | Pronto: CRUD, paginação, filtros, health, Swagger, testes (unit/integração/e2e) |
| [bff](./bff) | Pronto: proxy HTTP de tasks + health + Swagger + testes (unit/integração/e2e) |
| `front/` | Pasta reservada (Vite/React previsto na porta `5173`) |

---

## Arquitetura

```text
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌────────────┐
│  React UI   │────▶│  NestJS BFF  │────▶│  NestJS API  │────▶│ PostgreSQL │
│  (front)    │     │  :3002       │     │  :3001/api   │     │            │
└─────────────┘     └──────────────┘     └──────────────┘     └────────────┘
```

### Por que BFF?

- O browser não precisa conhecer detalhes internos da API
- Facilita CORS, agregação e adaptação de payload para a UI
- Permite evoluir a API sem quebrar o frontend de uma vez

### Fluxo interno da API (Clean Architecture leve)

```text
Controller (HTTP)
   → DTO + ValidationPipe
   → Service (regras)
   → Repository (DIP)
   → PrismaService
   → PostgreSQL
```

### Fluxo interno do BFF (Proxy)

```text
Controller (HTTP)
   → DTO + ValidationPipe
   → Service (proxy / gateway)
   → HttpService (Axios)
   → API interna
         ↓ (em erro)
   throwApiError (adapter Axios → Nest)
```

| Responsabilidade | BFF | API |
| ---------------- | --- | --- |
| Validar payload do front | sim | sim (defesa em profundidade) |
| Regras de domínio / CRUD | não | sim |
| Persistência (Prisma/Postgres) | não | sim |
| Proxy HTTP tipado | sim | não |
| Traduzir erros da API para o front | sim | — |

---

## Estrutura do repositório

```text
task-manager/
├── api/                 # API de domínio (NestJS + Prisma)
│   ├── prisma/          # schema, migrations, seed
│   ├── src/
│   │   ├── bootstrap/   # create-app (CORS, pipes, filter, Swagger)
│   │   ├── common/      # Prisma + exception filter
│   │   ├── config/      # validação de env (Joi)
│   │   ├── health/
│   │   ├── tasks/       # controller / service / repository / dto
│   │   └── generated/   # Prisma Client gerado
│   └── test/            # integração + e2e
├── bff/                 # Backend for Frontend (NestJS + Axios)
│   ├── src/
│   │   ├── bootstrap/   # create-app (CORS, pipes, Swagger)
│   │   ├── common/      # exception filter
│   │   ├── config/      # validação de env (Joi)
│   │   ├── http/        # HttpClientModule + throwApiError
│   │   ├── health/      # health do BFF + API
│   │   └── tasks/       # controller / service (proxy) / dto
│   └── test/            # integração + e2e (nock)
├── front/               # Frontend (reservado)
└── README.md
```

---

## Stack e bibliotecas (por quê)

### Núcleo compartilhado (API + BFF)

| Biblioteca | Papel | Por que escolhemos |
| ---------- | ----- | ------------------ |
| **Node.js + TypeScript** | Runtime e tipagem | Ecossistema maduro; tipagem reduz bugs e documenta contratos |
| **NestJS** (`@nestjs/common`, `core`, `platform-express`) | Framework HTTP modular | Módulos, DI, pipes/filters/guards e estrutura alinhada a SOLID |
| **@nestjs/config** | Configuração | Carrega `.env` e injeta `ConfigService` de forma tipada |
| **Joi** | Validação de env | Falha cedo no boot se `PORT`, `DATABASE_URL` / `API_BASE_URL` etc. estiverem inválidos |
| **class-validator** + **class-transformer** | Validação de DTO | Com `ValidationPipe` (`whitelist` + `forbidNonWhitelisted`) rejeita payload inválido/extra |
| **@nestjs/swagger** | OpenAPI | Documentação interativa dos endpoints (`/api/docs` na API) |
| **reflect-metadata** + **rxjs** | Base do Nest | Decorators e streams usados internamente pelo framework |
| **Jest** + **Supertest** | Testes | Unitários, integração e e2e HTTP |
| **ESLint** + **Prettier** | Qualidade/estilo | Padroniza o código e evita discussões de formatação |
| **TypeScript ESLint** | Lint tipado | Regras modernas para TS/Nest |

### Específicas da API (`api/`)

| Biblioteca | Papel | Por que escolhemos |
| ---------- | ----- | ------------------ |
| **PostgreSQL** | Banco relacional | Tipos fortes, JSON, enums, ótimo com Prisma; referência sólida para CRUD |
| **Prisma** (`prisma`, `@prisma/client`) | ORM + migrations | Schema tipado, migrations versionadas, client gerado, DX alta |
| **@prisma/adapter-pg** + **pg** | Driver Prisma 7 | No Prisma 7 a conexão usa adapter; `pg` é o cliente oficial do Postgres |
| **dotenv** | Env em scripts/CLI | Garante `DATABASE_URL` disponível em seed/migrate/runtime |
| **@swc/jest** + **@swc/core** | Transform nos testes | Mais rápido que `ts-jest` com decorators Nest |
| **tsx** | Execução TS (seed) | Roda `prisma/seed.ts` sem build prévio |

#### O que a API deliberadamente não usa

- ORM “cru” sem tipagem (ex.: só SQL string) — Prisma reduz boilerplate e erros
- Acesso direto do front à API — responsabilidade do BFF

### Específicas do BFF (`bff/`)

| Biblioteca | Papel | Por que escolhemos |
| ---------- | ----- | ------------------ |
| **@nestjs/axios** + **axios** | Cliente HTTP | Padrão Nest para chamar a API; timeout, baseURL e headers |
| **@nestjs/mapped-types** | DTOs parciais | `PartialType` no update sem duplicar campos |
| **@swc/jest** + **@swc/core** | Transform nos testes | Mesma stack rápida da API |
| **nock** | Mock HTTP | Simula a API em integração/e2e sem subir o Postgres |

O BFF **não** usa Prisma: ele não persiste domínio; só orquestra chamadas à API.

### Frontend (`front/`) — planejado

| Biblioteca (prevista) | Papel | Por que |
| --------------------- | ----- | ------- |
| **React** | UI | Componente padrão do ecossistema |
| **Vite** | Bundler/dev server | DX rápida; porta típica `5173` (já no `CORS_ORIGIN` / `FRONTEND_ORIGIN`) |

---

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

Status no banco como **enum** para garantir valores válidos. No front, os rótulos podem ser traduzidos (Pendente, Em andamento, Concluída).

---

## Como subir o projeto

### Requisitos

- Node.js 20+
- npm
- PostgreSQL com banco `task_manager`

### 1) API (porta `3001`)

```bash
cd api
npm install
cp .env.example .env
```

```sql
CREATE DATABASE task_manager;
```

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
| API | [http://localhost:3001/api](http://localhost:3001/api) |
| Swagger | [http://localhost:3001/api/docs](http://localhost:3001/api/docs) |
| Health | [http://localhost:3001/api/health](http://localhost:3001/api/health) |

> Em `NODE_ENV=production`, o Swagger fica desligado por padrão.

### 2) BFF (porta `3002`)

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
| BFF | [http://localhost:3002/api](http://localhost:3002/api) |
| Swagger | [http://localhost:3002/api/docs](http://localhost:3002/api/docs) |
| Health | [http://localhost:3002/api/health](http://localhost:3002/api/health) |

> Em `NODE_ENV=production`, o Swagger do BFF também fica desligado por padrão.

### 3) Frontend

Pasta `front/` ainda sem código. Quando existir, a expectativa é consumir o **BFF**
(`FRONTEND_ORIGIN` / porta `5173`), não a API.

---

## Endpoints

### API (`:3001`)

| Método | Endpoint | Descrição |
| ------ | -------- | --------- |
| `POST` | `/api/tasks` | Criar tarefa |
| `GET` | `/api/tasks` | Listar (`page`, `limit`, `status`, `search`) |
| `GET` | `/api/tasks/:id` | Buscar por ID |
| `PATCH` | `/api/tasks/:id` | Atualizar |
| `DELETE` | `/api/tasks/:id` | Remover |
| `GET` | `/api/health` | Saúde da app + banco (`ok` / `degraded`) |

### BFF (`:3002`)

Espelha as operações de tasks via HTTP client (`API_BASE_URL`) e expõe health
próprio. Detalhes em [bff/README.md](./bff/README.md).

| Método | Endpoint | Descrição |
| ------ | -------- | --------- |
| `POST` | `/api/tasks` | Criar (proxy → API) |
| `GET` | `/api/tasks` | Listar (proxy → API) |
| `GET` | `/api/tasks/:id` | Buscar (proxy → API) |
| `PATCH` | `/api/tasks/:id` | Atualizar (proxy → API) |
| `DELETE` | `/api/tasks/:id` | Remover (proxy → API) |
| `GET` | `/api/health` | BFF + API (`ok` / `degraded`) |

---

## Princípios de código

Aplicamos de forma pragmática (sem overengineering):

| Princípio | Como aparece no projeto |
| --------- | ------------------------ |
| **S**ingle Responsibility | Controller HTTP fino; service com regras (API) ou proxy (BFF); repository com queries |
| **O**pen/Closed | Novos filtros/status sem reescrever o CRUD inteiro |
| **L**iskov | Implementação Prisma (API) / `HttpService` (BFF) substituíveis por contrato/mock |
| **I**nterface Segregation | Contrato `TasksRepository` só com operações de task |
| **D**ependency Inversion | API: service → `TASKS_REPOSITORY`; BFF: DI do Nest para HTTP/config |

### Design patterns (API + BFF)

| Padrão | API | BFF |
| ------ | --- | --- |
| **Repository** | `TasksRepository` + Prisma | — (persistência só na API) |
| **BFF / Proxy** | — | `TasksService` encaminha para a API |
| **Adapter** | Prisma repository / `PrismaPg` | `throwApiError` (Axios → Nest) |
| **DTO** | sim | sim |
| **DI + Module** | Nest feature modules | Nest feature modules |
| **Exception Filter** | `AllExceptionsFilter` | `AllExceptionsFilter` |
| **Factory** | `create-app` / pipes / Swagger | idem |

Clean Code na prática: nomes claros, DTOs explícitos, um filter de erros,
bootstrap único (`create-app`), env validado, comentários só onde explicam o *porquê*.

---

## Testes

### API

```bash
cd api
npm run test:all   # unit (100% coverage) + integração + e2e
```

| Tipo | O que cobre |
| ---- | ----------- |
| Unitário | Service, repository, filter, DTOs, bootstrap, health |
| Integração | Service + repository + Postgres real |
| E2E | Fluxo HTTP completo (`/api/tasks`, health, validação, Swagger) |

### BFF

```bash
cd bff
npm run test:all   # unit (100% coverage) + integração + e2e
```

| Tipo | O que cobre |
| ---- | ----------- |
| Unitário | Service, controller, filter, `throwApiError`, DTOs, bootstrap, health |
| Integração | Service + HttpClient com API mockada (nock) |
| E2E | Fluxo HTTP completo do BFF |

---

## Decisões técnicas

### Por que NestJS e não Express “puro”?

Queremos módulos, DI e convenções que escalam (features, filters, pipes)
sem inventar estrutura do zero.

### Por que Prisma só na API?

Persistência e regras de domínio ficam na API. O BFF orquestra HTTP; o front
renderiza. Evita acoplar UI e banco.

### Por que enum de status no Postgres?

O banco rejeita valores inválidos além da validação da aplicação.

### Por que Joi no env e class-validator nos DTOs?

Camadas diferentes: boot da app vs. cada request. Cada uma falha no momento certo.

### Por que Axios no BFF?

Cliente HTTP maduro, integrado ao Nest via `@nestjs/axios`, com timeout e
baseURL configuráveis.

### Por que monorepo?

Um lugar para ver o sistema inteiro (front → bff → api → db), com pacotes
independentes e deploys separados se necessário.

---

## Documentação por pacote

- API detalhada (endpoints, Prisma, erros): [api/README.md](./api/README.md)
- BFF (padrões, stack, testes): [bff/README.md](./bff/README.md)

### Documentação MkDocs (GitHub Pages)

Documentação completa do monorepo com Material for MkDocs, publicada via GitHub Pages.

- Site (após ativar Pages em `main`): [thataspinola.github.io/task-manager](https://thataspinola.github.io/task-manager/)
- Fonte: pasta [`docs/`](./docs/)
- Config: [`mkdocs.yml`](./mkdocs.yml)
- Workflows na raiz: [`.github/workflows/`](./.github/workflows/)

Os Actions só disparam quando o push altera o pacote correspondente (`paths`):

| Workflow | Quando roda |
| -------- | ----------- |
| `api-*` | mudanças em `api/` |
| `bff-*` | mudanças em `bff/` |
| `docs.yml` | mudanças em `docs/` / MkDocs |

Pré-visualizar localmente:

```bash
pip install -r requirements-docs.txt
python -m mkdocs serve
```

---

## Licença

UNLICENSED — uso privado.
