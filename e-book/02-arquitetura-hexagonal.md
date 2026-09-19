---
title: "Arquitetura hexagonal"
order: 2
part: "Visão geral"
status: draft
sources:
  - README.md
  - src/src/factories
---

Este arquivo deve explicar a arquitetura hexagonal (portas e adaptadores) adotada pelo serviço e a regra estrita de que o domínio nunca importa infraestrutura. Deve apresentar o diagrama de composição do README, explicar o papel de cada módulo `*.port.ts` como interface de domínio, e mostrar como `src/factories/` é o único lugar que amarra uma porta a uma implementação concreta (banco, cliente de LLM, dublê de teste).
