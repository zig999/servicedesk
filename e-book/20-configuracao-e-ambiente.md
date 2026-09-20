---
title: "Configuração e ambiente"
order: 20
part: "Infraestrutura"
status: draft
sources:
  - src/src/config/env.ts
  - README.md
---

Este arquivo deve explicar como as variáveis de ambiente são lidas e validadas uma única vez na subida do processo em `env.ts`, derrubando o processo antes de aceitar qualquer requisição caso alguma esteja ausente ou malformada. Deve listar as variáveis obrigatórias e opcionais da tabela do README e explicar por que `ANTHROPIC_API_KEY` fica fora desse schema.
