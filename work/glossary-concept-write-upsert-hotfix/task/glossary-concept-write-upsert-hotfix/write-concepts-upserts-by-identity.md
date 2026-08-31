---
title: writeConcepts upserta por identidade, sem apagar a tabela inteira
summary: Corrige RelationalGlossaryStore.writeConcepts para não fazer DELETE sem filtro nas tabelas concepts e concept_accepts, permitindo salvar qualquer concept mesmo quando outro já tem evidência associada.
objective: PUT /v1/glossary/concepts/:name cria ou substitui o concept no nome dado sem falhar quando qualquer linha de concepts é referenciada por capabilities, investigation_evidence ou investigation_evaluation_citations.
criteria:
- PUT /v1/glossary/concepts/cpt-ifs-sync criando um concept novo (nome que o glossário ainda não detém), contra um banco onde outro concept já existente tem ao menos uma linha em capabilities, investigation_evidence ou investigation_evaluation_citations citando-o, não retorna 500, e o glossário passa a manter, sob esse nome, exatamente o accepts, o ttl e a description enviados.
- Atualizar o ttl, a description ou o accepts de um concept já existente sucede mesmo quando outro concept registrado está referenciado por capabilities, investigation_evidence ou investigation_evaluation_citations, e o glossário passa a manter, sob o nome atualizado, exatamente os valores enviados, substituindo os que estavam ali.
- Atualizar o ttl, a description ou o accepts de um concept cuja própria linha já é referenciada por capabilities, investigation_evidence ou investigation_evaluation_citations sucede sem apagar nem violar essas linhas referenciadas, e o glossário passa a manter, sob esse nome, exatamente os valores enviados.
- Uma linha de concepts referenciada por capabilities, investigation_evidence ou investigation_evaluation_citations nunca é apagada como efeito colateral de escrever um concept de nome diferente.
- Atualizar o accepts de um concept substitui só as linhas de concept_accepts desse concept, nunca as de outro concept.
- Registrar um concept sem description continua sendo recusado antes de qualquer escrita, exatamente como antes desta correção.
- Nenhuma escrita em concepts ou concept_accepts emite mais um DELETE sem filtro de WHERE contra a tabela inteira.
- O glossário nunca passa a manter um mesmo nome de concept em duas linhas simultaneamente, em nenhum dos cenários acima.
implements:
- contracts/glossary/glossary-authoring
- domain/glossary/concept
- domain/integration/capability
- domain/investigation/evidence
- domain/investigation/citation
- rules/glossary/a-vocabulary-holds-each-name-once
- rules/glossary/a-concept-declares-its-description
sources:
- intake/scope.md
---

## What it is

A correção do mecanismo de escrita do glossário de concepts: writeConcepts passa a fazer upsert
por identidade (name) em concepts, e reconciliação escopada por concept_name em concept_accepts,
em vez de apagar e reinserir as duas tabelas inteiras.

## Notes

UNDERDETERMINED, from the specification — domain/investigation/evidence states that concept_description and fields are an evidence item's own snapshot, held exactly as the glossary held them at collection time and never re-read afterward.
No criterion here pins that immutability: an implementation that also rewrites concept_description on existing investigation_evidence rows when the cited concept's description changes would still satisfy every criterion as written.
The suite must exclude this: no test may treat writeConcepts updating investigation_evidence.concept_description as acceptable.

REMAINDER, from the specification — rules/glossary/a-vocabulary-holds-each-name-once also states a read-side refusal: a duplicate-name read answers HTTP 500 reporting DuplicateGlossaryNameError.
No criterion of this task answers that read-side clause; this task's criteria hold only the store-side half, that a name is never held twice.
Belongs to the glossary read surface already delivered under contracts/glossary/glossary-authoring's neighbouring read operations, not this write task.

The no-description-refusal criterion is worded against pre-correction behavior ("exatamente como antes desta correção") rather than against rules/glossary/a-concept-declares-its-description's own statement.
The test proving it must verify the rule's own stated outcome — an HTTP 422 response reporting ConceptDescriptionRequiredError, on both the create-at-a-new-name and the replace-at-an-existing-name path — not merely that behavior did not regress.
