# Task Manager Frontend

UI React (Vite) que consome **somente** o NestJS BFF.

```text
React (:5173)  →  BFF (:3002/api)  →  API (:3001/api)  →  PostgreSQL
```

Documentação do monorepo: [../README.md](../README.md)

---

## Índice

1. [Papel](#papel)
2. [Design patterns](#design-patterns)
3. [Stack](#stack)
4. [Estrutura](#estrutura)
5. [Como rodar](#como-rodar)
6. [Testes](#testes)
7. [Qualidade](#qualidade)
8. [SOLID e Clean Code](#solid-e-clean-code)

---

## Papel

| Responsabilidade | Frontend | BFF | API |
| ---------------- | -------- | --- | --- |
| UI / UX | sim | não | não |
| Cache de listagem (TanStack Query) | sim | não | não |
| Validação de formulário (cliente) | sim | sim | sim |
| Proxy HTTP / CORS | não | sim | — |
| Regras de domínio / persistência | não | não | sim |

Regra de ouro: o browser **nunca** chama a API diretamente.

---

## Design patterns

| Padrão | Onde | Para quê |
| ------ | ---- | -------- |
| **Facade HTTP** | `api/tasks-api.ts` | Isola hooks/UI do Axios |
| **Factory** | `api/http-client.ts` | `createHttpClient` / `resolveBffBaseUrl` |
| **Container / Presentational** | `App.tsx` + `components/*` | Orquestra estado; cards/forms renderizam |
| **Query keys** | `hooks/use-tasks.ts` | Invalidação previsível após mutações |
| **Error adapter (UI)** | `ErrorMessage` | Axios / BFF → mensagem legível |

---

## Stack

| Biblioteca | Papel |
| ---------- | ----- |
| React 19 + Vite | UI e bundler |
| TypeScript | Tipagem |
| Axios | HTTP para o BFF |
| TanStack Query | Cache, loading, mutações |
| Vitest + Testing Library | Testes unitários (coverage 100%) |
| ESLint + Prettier | Lint e formato |
| `@sentry/react` | Erros no browser (opcional via `VITE_SENTRY_DSN`) |

---

## Estrutura

```text
frontend/
├── src/
│   ├── api/                 # http-client + tasks-api
│   ├── components/          # UI + *.spec.tsx
│   ├── hooks/               # use-tasks
│   ├── lib/                 # helpers testáveis
│   ├── observability/       # Sentry opcional
│   ├── test/                # setup + utils
│   ├── types/
│   ├── App.tsx
│   └── main.tsx             # bootstrap (excluído da coverage)
├── sonar-project.properties
├── .env.example
└── vite.config.ts
```

---

## Como rodar

### Requisitos

- Node.js 20+
- BFF em `http://localhost:3002/api`

### Setup

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

```env
VITE_BFF_BASE_URL=http://localhost:3002/api
```

Sentry (opcional):

```env
VITE_SENTRY_DSN=
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
```

### Dev / build / preview

```bash
npm run dev        # http://localhost:5173
npm run build
npm run preview    # http://localhost:4173
```

O BFF deve permitir as origens `5173` e `4173` (`FRONTEND_ORIGIN` / `FRONTEND_ORIGINS`).

---

## Testes

| Script | Descrição |
| ------ | --------- |
| `npm test` / `npm run test:unit` | Vitest + coverage 100% |
| `npm run test:watch` | Watch |
| `npm run test:run` | Sem coverage |
| `npm run test:all` | Alias do unitário |

Meta: **coverageThreshold 100%** (branches/functions/lines/statements).  
`main.tsx` e specs ficam fora do collect (como `main.ts` / `instrument.ts` na API/BFF).

---

## Qualidade

```bash
npm run lint
npm run format:check
npm run build
npm run sonar:scan   # requer SONAR_TOKEN na raiz + coverage gerado
```

CI: `.github/workflows/frontend-validate.yml` (lint, format, build, test, Sonar, PR → `develop`).

---

## SOLID e Clean Code

- Comentários só no **porquê** / papel do módulo (JSDoc no topo).
- Componentes finos; HTTP e cache nos módulos `api/` e `hooks/`.
- Contratos alinhados ao BFF (`TaskStatus`, `ApiErrorResponse`).
