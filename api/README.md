# Task Manager API

API REST para gerenciamento de tarefas, desenvolvida com NestJS, Prisma ORM e PostgreSQL.

## Tecnologias

- Node.js
- TypeScript
- NestJS
- Prisma ORM
- PostgreSQL
- Swagger/OpenAPI
- Joi
- Jest

## Arquitetura

```text
Controller
   ↓
DTO e validação
   ↓
Service
   ↓
Repository (DIP)
   ↓
PrismaService
   ↓
PostgreSQL
```

Esta API faz parte de uma arquitetura composta por:

```text
React Frontend
      ↓
NestJS BFF
      ↓
NestJS API
      ↓
PostgreSQL
```

O frontend não deve acessar esta API diretamente. A integração será intermediada pelo BFF.

## Funcionalidades

- Criar tarefas
- Listar tarefas
- Consultar tarefa por ID
- Atualizar tarefas
- Excluir tarefas
- Filtrar por status
- Buscar por título ou descrição
- Paginação
- Validação dos dados de entrada
- Validação das variáveis de ambiente
- Health check da aplicação e do banco
- Documentação Swagger
- Tratamento global de erros
- Seed do banco
- Testes unitários

## Modelo de tarefa

```text
Task
├── id
├── title
├── description
├── status
├── createdAt
└── updatedAt
```

Status disponíveis:

```text
PENDING
IN_PROGRESS
COMPLETED
```

## Requisitos

- Node.js
- npm
- PostgreSQL
- Banco local `task_manager`

## Instalação

Instale as dependências:

```bash
npm install
```

## Configuração do ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Configure o `.env`:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/task_manager?schema=public"
```

## Criar o banco

No PostgreSQL:

```sql
CREATE DATABASE task_manager;
```

## Prisma

Validar o schema:

```bash
npx prisma validate
```

Gerar o Prisma Client:

```bash
npm run prisma:generate
```

Criar ou executar migrations:

```bash
npm run prisma:migrate
```

Executar o seed:

```bash
npm run prisma:seed
```

Abrir o Prisma Studio:

```bash
npm run prisma:studio
```

## Executar a aplicação

Modo de desenvolvimento:

```bash
npm run start:dev
```

Build:

```bash
npm run build
```

Produção:

```bash
npm run start:prod
```

## Endereços

API:

```text
http://localhost:3001/api
```

Swagger:

```text
http://localhost:3001/api/docs
```

Health check:

```text
http://localhost:3001/api/health
```

## Endpoints

| Método | Endpoint         | Descrição                   |
| ------ | ---------------- | --------------------------- |
| POST   | `/api/tasks`     | Criar tarefa                |
| GET    | `/api/tasks`     | Listar tarefas              |
| GET    | `/api/tasks/:id` | Consultar tarefa            |
| PATCH  | `/api/tasks/:id` | Atualizar tarefa            |
| DELETE | `/api/tasks/:id` | Excluir tarefa              |
| GET    | `/api/health`    | Verificar aplicação e banco |

## Criar uma tarefa

```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Finalizar API",
    "description": "Adicionar documentação",
    "status": "IN_PROGRESS"
  }'
```

## Listar tarefas

```bash
curl "http://localhost:3001/api/tasks?page=1&limit=10"
```

## Filtrar por status

```bash
curl "http://localhost:3001/api/tasks?status=PENDING"
```

## Buscar por texto

```bash
curl "http://localhost:3001/api/tasks?search=NestJS"
```

## Atualizar uma tarefa

```bash
curl -X PATCH http://localhost:3001/api/tasks/UUID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED"
  }'
```

## Excluir uma tarefa

```bash
curl -i -X DELETE http://localhost:3001/api/tasks/UUID
```

## Testes

Executar os testes:

```bash
npm test
```

Executar em modo watch:

```bash
npm run test:watch
```

Executar com cobertura:

```bash
npm run test:cov
```

## Estrutura

```text
api/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│   ├── bootstrap/
│   │   └── create-app.ts
│   ├── common/
│   │   ├── database/
│   │   └── filters/
│   │       └── all-exceptions.filter.ts
│   ├── config/
│   ├── generated/prisma/
│   ├── health/
│   ├── tasks/
│   │   ├── constants/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── task.module.ts
│   ├── app.module.ts
│   └── main.ts
│
├── test/
├── .env.example
├── package.json
├── prisma.config.ts
└── README.md
```

## Respostas de erro

Exemplo de erro de validação:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["title must be longer than or equal to 3 characters"],
  "path": "/api/tasks",
  "method": "POST",
  "timestamp": "2026-07-18T20:00:00.000Z"
}
```

Exemplo de recurso não encontrado:

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Task não encontrada",
  "path": "/api/tasks/uuid",
  "method": "GET",
  "timestamp": "2026-07-18T20:00:00.000Z"
}
```
