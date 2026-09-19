---
title: "Estratégia de testes"
order: 25
part: "Qualidade e fechamento"
status: draft
sources:
  - src/src/__tests__/unit
  - src/src/__tests__/integration
  - src/src/__tests__/integration/factories
---

Este arquivo deve explicar a divisão entre testes unitários e de integração, o papel das factories de teste (`diagnose-server.factory`, `production-diagnose.factory`, `simulate-case-server.factory`, `simulate-hypothesis-server.factory`) na composição de um servidor de teste com dublês ou implementações reais, e o uso de fixtures (`src/fixtures/`) para dados semeados.
