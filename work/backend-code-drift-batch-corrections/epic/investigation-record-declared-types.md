---
title: The investigation record's declared types held where code declares them
summary: The corrections where a code declaration of an investigation record's attribute disagrees with
  the type or required-ness its domain node declares -- the aggregate's own type and the simulation response
  schemas.
rationale: I grouped these two corrections because both are a declaration in code disagreeing with an
  attribute declaration in a domain node, with no behavior of the running system in dispute; the scope
  listed the findings by file and stated no grouping.
sources:
- intake/scope.md
covers:
- domain/investigation/investigation
- domain/investigation/usage
- domain/investigation/evaluation
- domain/investigation/durations
- rules/investigation/written-at-records-when-the-write-settled
---
## What it is
Duas correcoes sobre declaracoes de atributos do proprio registro de investigacao.
O tipo Investigation declara written_at opcional onde domain/investigation/investigation declara obrigatorio.
Os dois schemas de resposta de simulacao validam usage tokens, evaluation elapsed_ms e as quatro durations como numeros simples onde cada no de dominio declara integer.

## Notes
Nenhuma das correcoes muda o que o sistema coleta, julga ou responde; ambas mudam o que uma declaracao admite.
