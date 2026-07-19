# Task Manager BFF

Backend for Frontend (NestJS) que conecta o React à API interna de domínio.

```text
React (front)  →  BFF (:3002/api)  →  API (:3001/api)  →  PostgreSQL
```

O BFF **não** persiste regras de negócio nem acessa o banco. Ele valida a
entrada do frontend, encaminha chamadas HTTP tipadas à API e traduz erros
para um contrato estável.

Documentação do monorepo: [../README.md](../README.md)

---

## Índice

1. [Papel](#papel)
2. [Design patterns](#design-patterns)
3. [Stack e bibliotecas](#stack-e-bibliotecas)
4. [Estrutura](#estrutura)
5. [Como rodar](#como-rodar)
6. [Endpoints](#endpoints)
7. [Testes](#testes)
8. [SOLID e Clean Code](#solid-e-clean-code)

---

## Papel

| Responsabilidade | BFF | API |
| ---------------- | --- | --- |
| Validar payload do front | sim | sim (defesa em profundidade) |
| Regras de domínio / CRUD | não | sim |
| Persistência (Prisma/Postgres) | não | sim |
| Proxy HTTP tipado | sim | não |
| Adaptar erros da API para o front | sim | — |

---

## Design patterns

Sim — usamos padrões de forma pragmática (sem overengineering).

| Padrão | Onde | Para quê |
| ------ | ---- | -------- |
| **BFF (Backend for Frontend)** | o pacote inteiro | Camada dedicada à UI; isola o browser da API de domínio |
| **Proxy / Gateway** | `TasksService` | Encaminha CRUD para `/tasks` da API via `HttpService` |
| **Adapter / Translator** | `http/api-error.util.ts` | Converte `AxiosError` → `HttpException` Nest (502/504/404…) |
| **DTO** | `tasks/dto/*` | Contrato de entrada/saída + validação + Swagger |
| **Dependency Injection** | Nest modules | `HttpService`, `ConfigService`, filter via `APP_FILTER` |
| **Module (feature module)** | `TasksModule`, `HealthModule` | Agrupa controller + service por capacidade |
| **Exception Filter** | `AllExceptionsFilter` | Resposta de erro JSON uniforme (`path`, `method`, `timestamp`) |
| **Factory** | `bootstrap/create-app.ts` | `createValidationPipe`, `configureApp`, `setupSwagger` |

### Relação com a API

Na **API** o padrão central extra é o **Repository** (`TasksRepository` +
`PrismaTasksRepository`) com **DIP**: o service depende da abstração, não do
Prisma.

No **BFF** não há repository de domínio — o “repositório remoto” é a própria
API, acessada pelo proxy HTTP.

```text
BFF:  Controller → Service (proxy) → HttpService → API
API:  Controller → Service (regras) → Repository → Prisma → PostgreSQL
```

---

## Stack e bibliotecas

| Biblioteca | Papel | Por quê |
| ---------- | ----- | ------- |
| **NestJS** | Framework modular | DI, modules, pipes, filters alinhados a SOLID |
| **@nestjs/axios** + **axios** | Cliente HTTP | Padrão Nest para chamar a API; timeout e `baseURL` |
| **@nestjs/config** + **Joi** | Env | Falha cedo se `API_BASE_URL` / `FRONTEND_ORIGIN` inválidos |
| **class-validator** / **class-transformer** | DTOs | `ValidationPipe` com whitelist |
| **@nestjs/swagger** | OpenAPI | Docs em `/api/docs` |
| **@nestjs/mapped-types** | `PartialType` | Update sem duplicar campos do create |
| **Jest** + **@swc/jest** | Testes unitários | Cobertura 100%, transform rápido |
| **nock** + **supertest** | Integração / e2e | Mock da API + HTTP real do BFF |

---

## Estrutura

```text
bff/
├── src/
│   ├── bootstrap/          # create-app (CORS, pipes, Swagger)
│   ├── common/filters/     # AllExceptionsFilter
│   ├── config/             # envValidationSchema (Joi)
│   ├── health/             # health do BFF + API
│   ├── http/               # HttpClientModule + throwApiError
│   ├── tasks/
│   │   ├── controller/     # thin HTTP
│   │   ├── service/        # proxy tipado
│   │   ├── dto/
│   │   └── types/
│   ├── app.module.ts
│   └── main.ts
└── test/                   # integração + e2e (nock)
```

---

## Como rodar

### Requisitos

- Node.js 20+
- API rodando (padrão em `http://localhost:3001/api`)

### Setup

```bash
cp .env.example .env
npm install
npm run start:dev
```

```env
NODE_ENV=development
PORT=3002
API_BASE_URL=http://localhost:3001/api
FRONTEND_ORIGIN=http://localhost:5173
HTTP_TIMEOUT=5000
```

| Recurso | URL |
| ------- | --- |
| BFF | [http://localhost:3002/api](http://localhost:3002/api) |
| Swagger | [http://localhost:3002/api/docs](http://localhost:3002/api/docs) |
| Health | [http://localhost:3002/api/health](http://localhost:3002/api/health) |

> Em `NODE_ENV=production`, o Swagger fica desligado por padrão.

---

## Endpoints

| Método | Endpoint | Descrição |
| ------ | -------- | --------- |
| `POST` | `/api/tasks` | Criar (proxy) |
| `GET` | `/api/tasks` | Listar (proxy) |
| `GET` | `/api/tasks/:id` | Buscar (proxy) |
| `PATCH` | `/api/tasks/:id` | Atualizar (proxy) |
| `DELETE` | `/api/tasks/:id` | Remover (proxy) |
| `GET` | `/api/health` | BFF + API (`ok` / `degraded`) |

---

## Testes

```bash
npm run test:all
```

| Tipo | O que cobre |
| ---- | ----------- |
| Unitário | Service, controller, filter, `throwApiError`, DTOs, bootstrap, health — **100%** |
| Integração | `TasksService` + `HttpClientModule` com API mockada (nock) |
| E2E | Fluxo HTTP do BFF (CRUD, validação, 404 upstream, health, Swagger) |

---

## SOLID e Clean Code

| Princípio | No BFF |
| --------- | ------ |
| **S** | Controller só HTTP; service só proxy; `throwApiError` só tradução de erro |
| **O** | Novos endpoints de proxy sem reescrever o filter/HTTP client |
| **L** | `HttpService` injetável — trocável por mock nos testes |
| **I** | Módulos por feature (`Tasks`, `Health`) sem interfaces inchadas |
| **D** | Dependências via DI do Nest (`HttpService`, `ConfigService`) |

Clean Code: nomes claros, DTOs explícitos, bootstrap único, env validado,
comentários só no *porquê*.
