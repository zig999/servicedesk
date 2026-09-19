---
title: "Camada HTTP"
order: 19
part: "Infraestrutura"
status: draft
sources:
  - src/src/http/build-app.ts
  - src/src/http/diagnose.controller.ts
  - src/src/http/diagnose.routes.ts
  - src/src/http/error-handler.middleware.ts
  - src/src/http/rate-limit.middleware.ts
---

Este arquivo deve apresentar a camada HTTP construída sobre Fastify: o padrão controller/routes replicado para cada recurso, a validação de DTOs com Zod, o tratamento de erro genérico (`error-handler.middleware.ts`) e o rate limiting. Deve usar a rota `POST /v1/diagnose` como exemplo guiado, com o corpo de requisição e resposta documentados no README, e código verbatim do controller.
