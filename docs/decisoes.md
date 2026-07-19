# Decisões técnicas

## Por que NestJS e não Express “puro”?

Módulos, DI e convenções que escalam (features, filters, pipes) sem inventar
estrutura do zero.

## Por que Prisma só na API?

Persistência e regras de domínio ficam na API. O BFF orquestra HTTP; o front
renderiza. Evita acoplar UI e banco.

## Por que enum de status no Postgres?

O banco rejeita valores inválidos além da validação da aplicação.

## Por que Joi no env e class-validator nos DTOs?

Camadas diferentes: boot da app vs. cada request. Cada uma falha no momento certo.

## Por que Axios no BFF?

Cliente HTTP maduro, integrado ao Nest via `@nestjs/axios`, com timeout e
`baseURL` configuráveis.

## Por que monorepo?

Um lugar para ver o sistema inteiro (front → bff → api → db), com pacotes
independentes e pipelines separados.

## Por que MkDocs + GitHub Pages?

Documentação versionada junto com o código, tema Material legível, e histórico
de pushes gerado automaticamente no CI.

## Por que Prometheus + Grafana + Sentry + Sonar Community?

- Métricas e alarmes open source (sem APM pago)
- Sentry free tier para erros reais em runtime
- SonarQube Community self-hosted para quality gate no CI
