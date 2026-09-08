---
title: Integer-declared numeric fields of the simulation responses validate as integers
summary: usage tokens, evaluation elapsed_ms and the durations fields in both simulation response schemas
  validate as integers, as their domain nodes declare.
rationale: I merged the six findings across the two DTO files into one task because they are one decision
  about one wire type declared twice in near-duplicate sibling schemas, falsified by the same criteria;
  splitting per file would give two tasks with identical criteria over the same nodes.
sources:
- intake/scope.md
objective: Every numeric field of the simulate-case and simulate-hypothesis response schemas whose domain
  node declares integer is validated as an integer.
criteria:
- A response whose usage.input_tokens is fractional fails validation in the simulate-case response schema
  and in the simulate-hypothesis response schema.
- A response whose usage.output_tokens is fractional fails validation in both response schemas.
- A response whose evaluation elapsed_ms is fractional fails validation in both response schemas.
- A response whose durations.collection is fractional fails validation in both response schemas.
- A response whose durations.judgment is fractional fails validation in both response schemas.
- A response whose durations.total is fractional fails validation in both response schemas.
- A simulate-case response whose durations.writing is present and fractional fails validation.
- A response carrying integers in all of those fields, otherwise shaped as the simulation pipeline produces
  it, passes validation unchanged.
- Each of the two files continues to declare its own usage and durations schemas, with no shared schema
  module introduced.
implements:
- domain/investigation/usage
- domain/investigation/evaluation
- domain/investigation/durations
---
## What it is
domain/investigation/usage declara input_tokens e output_tokens integer, domain/investigation/evaluation declara elapsed_ms integer, e domain/investigation/durations declara collection, judgment, writing e total integer.
Os dois schemas de resposta validam todos esses campos com um simples numero, entao o tipo de fio admite valores fracionarios que o tipo de dominio nao admite.

## Notes
UNDERDETERMINED, from the specification -- nada nos criterios preserva a presenca condicional que os nos candidatos declaram (usage/elapsed_ms/prompt presentes so quando uma chamada aconteceu; writing presente so quando uma consolidacao aconteceu), entao uma implementacao pode apertar esses campos para integer e torna-los obrigatorios ao mesmo tempo, o que a especificacao nao pede. Passaria: declarar evaluation.usage, evaluation.elapsed_ms e durations.writing como integers obrigatorios nos dois schemas -- todo criterio se satisfaz, enquanto uma resposta cujo evaluation carrega reason no-data, ou uma corrida que nunca alcancou consolidacao, seriam recusadas indevidamente.
UNDERDETERMINED, from the specification -- nenhum candidato declara um piso para os campos numericos inteiros, entao os criterios admitem um piso que a especificacao recusa em outro lugar: rules/investigation/a-measured-duration-below-one-millisecond-is-zero (fora do conjunto de candidatos desta tarefa) diz que uma duracao medida abaixo de um milissegundo e gravada como zero. Passaria: declarar esses campos como integer positivo (minimo 1) -- todo criterio se satisfaz, enquanto um estagio medido abaixo de um milissegundo, que a especificacao le como zero, seria recusado indevidamente.
REMAINDER, from the specification -- rules/investigation/written-at-records-when-the-write-settled e candidato do epic mas nao e alcancado por nenhum criterio desta tarefa; toda clausula sua e sobre a persistencia de uma investigacao, e uma simulacao nao persiste nada. Coberto pela tarefa irma written-at-is-required, no mesmo epic.
ADVISORY, from the specification -- o criterio 9 (cada um dos dois arquivos continua declarando seus proprios schemas de usage e durations, sem introduzir um modulo compartilhado) nao e respondido por nenhum candidato: e uma condicao sobre organizacao de codigo, que pertence ao padrao do projeto, nunca a um no de especificacao.
ADVISORY, from the specification -- o objetivo fala em todo campo numerico cujo no de dominio declara integer, mas domain/investigation/usage cita domain/investigation/cost (o total entre chamadas), que nao e candidato aqui. Se algum dos dois schemas de resposta carregar um campo integer de cost ou de outro no fora do conjunto, o objetivo alcanca fora do covers deste epic; verificar antes de implementar.
Decision, beyond the covers — stand: os criterios explicitos desta tarefa ja enumeram todos os campos que ela de fato corrige (usage, evaluation.elapsed_ms, durations); domain/investigation/cost e citado so como alerta de escopo, nao como fato que esta tarefa implementa, entao crescer o covers para ele agora seria reivindicar um comportamento que nenhum criterio prova.
Decision, beyond the covers — stand: rules/investigation/a-measured-duration-below-one-millisecond-is-zero e o motivo por tras de uma nota UNDERDETERMINED, nunca um fato que esta tarefa implementa ou contradiz; a nota ja registra a lacuna para quem escrever os testes, e crescer o covers so para cita-lo obrigaria um rejulgamento sem mudar nenhum criterio.
