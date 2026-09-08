---
title: Seeded concepts publish a stated meaning
summary: The correction where the seed writes glossary concepts with no description, which domain/glossary/concept
  declares required.
rationale: I cut this as its own epic because it is the only finding in the scope answering for the glossary
  context and the only one whose correction is fixture data rather than a code declaration or a code path.
sources:
- intake/scope.md
covers:
- domain/glossary/concept
- rules/glossary/a-concept-declares-its-description
- rules/glossary/a-description-states-meaning-never-policy
---
## What it is
O script de seed insere conceitos por SQL direto e nunca fornece uma description.
domain/glossary/concept declara description obrigatoria, e rules/glossary/a-concept-declares-its-description recusa um registro que nao a carregue.

## Notes
O caminho de imposicao ja existe em src/src/glossary/glossary.service.ts como namesNoDescription e ConceptDescriptionRequiredError, e o inventario registra que o seed deve fornecer uma description pelo seu proprio caminho de leitura de fixture, em vez de reimplementar essa guarda.
