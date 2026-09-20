---
title: "HTTP Connector: execução da chamada"
order: 11
part: "Contexto Glossário e Integração"
status: draft
sources:
  - src/src/http-connector/connector-call-descriptor.ts
  - src/src/http-connector/connector-request-resolver.ts
  - src/src/http-connector/connector-http-issuer.ts
  - src/src/http-connector/http-connector-call-configuration.ts
  - src/src/http-connector/response-path-extractor.ts
  - src/src/connector-registry/subject-placeholder-resolution.ts
---

Este arquivo deve mostrar como uma chamada HTTP real a um sistema externo é montada e executada: resolução dos placeholders de endereço (`${subject:<atributo>}`, `${requester}`, `${credential:<VARIÁVEL>}`), disparo da chamada por `connector-http-issuer.ts` e extração dos campos de resposta mapeados pela capacidade. Deve usar código verbatim para ilustrar o formato dos placeholders e a extração de caminho de resposta.
