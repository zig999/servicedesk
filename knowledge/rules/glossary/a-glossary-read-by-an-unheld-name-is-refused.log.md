---
entries:
- field: statement
  unstated: What read-vocabulary-term and read-concept answer for a name nothing holds.
  decided: 'A refusal: HTTP 404 reporting VocabularyTermNotHeldError for a term, ConceptNotHeldError for a concept.'
  why: The material is the reconciliation record siegard-reconcile/connector-capability-corrections-post-closure-drift.md, whose findings report the delivered backend stating this fact while no node held it. The delivered glossary service answers the miss as data internally and the published route turns it into these two 404 refusals; the connector-configuration read already drew the same distinction between an empty result and a miss, and a caller of the published read learns the refusal, not the internal value.
---
