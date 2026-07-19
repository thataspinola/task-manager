# BFF — visão geral

Backend for Frontend (NestJS) que conecta o React à API de domínio.

```text
React → BFF (:3002/api) → API (:3001/api) → PostgreSQL
```

O BFF **não** persiste regras de negócio nem acessa o banco. Ele valida a entrada
do frontend, encaminha HTTP tipado à API e traduz erros para um contrato estável.

## Design patterns

| Padrão | Onde | Para quê |
| ------ | ---- | -------- |
| **BFF** | o pacote | Camada dedicada à UI |
| **Proxy / Gateway** | `TasksService` | Encaminha CRUD para a API |
| **Adapter** | `throwApiError` | Axios → `HttpException` Nest |
| **DTO** | `tasks/dto/*` | Contrato + validação + Swagger |
| **Exception Filter** | `AllExceptionsFilter` | Erro JSON uniforme |
| **Factory** | `create-app` | Bootstrap único |

## Stack

| Biblioteca | Papel |
| ---------- | ----- |
| NestJS | Framework modular |
| `@nestjs/axios` + Axios | Cliente HTTP |
| Joi | Validação de env |
| class-validator | DTOs |
| nock | Mock HTTP nos testes |

## Estrutura

```text
bff/
├── src/
│   ├── bootstrap/
│   ├── common/filters/
│   ├── config/
│   ├── health/
│   ├── http/          # HttpClientModule + throwApiError
│   └── tasks/         # controller / service (proxy) / dto
└── test/
```

## Como rodar

Veja [Começar](../comecar.md#2-bff-porta-3002).

## Testes

```bash
cd bff
npm run test:all
```
