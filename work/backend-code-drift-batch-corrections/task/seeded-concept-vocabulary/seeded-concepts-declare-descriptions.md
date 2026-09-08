---
title: Every seeded concept carries a stated description
summary: The seed writes no glossary concept without a description, supplying it from the concept fixture
  the seed already reads.
rationale: I cut this as one task because one write path supplying one required attribute is one outcome;
  the scope listed the finding and stated no cut.
sources:
- intake/scope.md
objective: Every concept the seed writes carries a non-empty description stating what the named observation
  means.
criteria:
- Every concept row the seed inserts carries a non-empty description.
- src/src/fixtures/glossary/concept.json declares a description for every concept it holds.
- The seed reads each concept description from that fixture rather than from a literal in the seed script.
- Each seeded description states what the named observation means and names no decision a case own criterion
  or a specification rule governs.
- The description requirement of rules/glossary/a-concept-declares-its-description refuses none of the
  concepts the seed writes.
- The seed does not re-declare the description guard or the description error that already stand in src/src/glossary/glossary.service.ts.
- The name, accepts and ttl each seeded concept already carries are unchanged.
implements:
- domain/glossary/concept
- rules/glossary/a-concept-declares-its-description
- rules/glossary/a-description-states-meaning-never-policy
---
## What it is
domain/glossary/concept declara description obrigatoria ao lado de name, accepts e ttl, e diz que a description declara o que a observacao nomeada significa.
rules/glossary/a-concept-declares-its-description recusa um registro ou atualizacao sem description, com HTTP 422 reportando ConceptDescriptionRequiredError.
O seed insere seus conceitos de fixture por SQL direto e nao fornece description para nenhum deles.

## Notes
REMAINDER, from the specification -- a metade de rules/glossary/a-description-states-meaning-never-policy sobre a description de um campo (em domain/investigation/field-semantics, no schema de saida de uma capability) nao e alcancada por nenhum criterio, que fala so dos conceitos que o seed escreve; pertence a uma tarefa sobre domain/investigation/field-semantics e a entrada de descricao de campo no schema de saida de uma capability -- escopo que este plano nao cobre.
Decision, beyond the covers — stand: nenhum criterio desta tarefa toca a description de um campo; nomear domain/investigation/field-semantics so descreve a outra metade do mesmo no que esta tarefa nao implementa, e crescer o covers do epic para um fato que nenhuma correcao aqui presente prova seria reivindicar trabalho que este plano nao faz.
ADVISORY, from the specification -- o criterio 4 exige que cada description declare significado; nenhum candidato declara o significado de um conceito individual (a especificacao mantem esses vocabularios como conjuntos abertos e registrados, nunca enumeracoes fixas), entao o texto de cada description e autorado pela entrega e so avaliavel por leitura contra a politica, nunca por comparacao com um no.
ADVISORY, from the specification -- rules/glossary/a-concept-declares-its-description fala do registro (the registry refuses to register or update a concept with no description), enquanto o criterio 1 fala de toda linha de conceito que o seed insere -- um sujeito que a regra nao nomeia. Nenhum candidato diz se as escritas do seed passam pelo caminho de registro ou alcancam o armazenamento direto; description obrigatoria em domain/glossary/concept vale de qualquer forma, entao nenhum criterio fica insatisfazivel, mas o criterio 5 (a exigencia de description nao recusa nenhum conceito do seed) le como evidencia de que a guarda rodou.
