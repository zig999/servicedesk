---
title: "Capability Registry"
order: 8
part: "Contexto Glossário e Integração"
status: draft
sources:
  - src/src/capability-registry/capability.ts
  - src/src/capability-registry/capability-registry.service.ts
  - src/src/capability-registry/capability-input-schema-shape.ts
  - src/src/capability-registry/capability-query.port.ts
  - src/src/capability-registry/capability-store.port.ts
  - src/src/capability-registry/connector-configurations-reader.port.ts
---

Este arquivo deve explicar o registro de capacidades read-only: o que é uma `Capability`, como ela relaciona um conceito do glossário a um conector, seus dois schemas (entrada e saída), e como `capability-registry.service.ts` normaliza o vocabulário do sistema-fonte para fora do domínio. Deve incluir os ports que isolam esse contexto de sua persistência.
