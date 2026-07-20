# Frontend — visão geral

UI React (Vite) do Task Manager. Consome **somente** o BFF.

```text
React (:5173) → BFF (:3002/api) → API (:3001/api) → PostgreSQL
```

## Stack

| Biblioteca | Papel |
| ---------- | ----- |
| React + Vite + TypeScript | UI |
| Axios + TanStack Query | HTTP e cache |
| Vitest + Testing Library | Testes (coverage 100%) |
| Prettier + ESLint | Formato e lint |
| `@sentry/react` | Erros no browser (opcional) |

## Estrutura

```text
frontend/
├── src/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── observability/
│   └── types/
├── sonar-project.properties
└── vite.config.ts
```

## Como rodar

Veja [Começar](../comecar.md#4-frontend-porta-5173). Detalhes extras no `frontend/README.md` do repositório.

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

```env
VITE_BFF_BASE_URL=http://localhost:3002/api
```

## Testes

```bash
cd frontend
npm run test:all
```

## CI

Workflow `frontend-validate.yml`: lint, `format:check`, build, testes com coverage, Sonar (se secrets) e PR automático para `develop`.
