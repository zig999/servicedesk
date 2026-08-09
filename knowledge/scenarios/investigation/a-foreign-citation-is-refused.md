---
subject: rules/investigation/a-citation-stays-within-the-hypothesis-collects
given:
  - the evaluator's response for one hypothesis cites a concept outside that hypothesis's collects
when:
  - the adapter validates the response
then:
  - the response is refused
  - one retry runs if the remaining deadline admits it, and otherwise the evaluation falls back to inconclusive with reason judgment-failure
involves:
  - domain/investigation/hypothesis-evaluator
  - domain/investigation/evaluation
---

## Description

The prompt contained only that hypothesis's criterion and evidence, so a foreign citation is an invented reference; the deadline beats the retry, always.
