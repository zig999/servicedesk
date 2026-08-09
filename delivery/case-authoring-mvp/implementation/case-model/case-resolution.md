---
title: Case resolution operations
summary: The case aggregate's three declared operations — collection-plan, requires-evaluation-of and resolve-outcome — as one pure module over the parsed aggregate, answering plain values from verdicts supplied as plain per-name values.
task: sha256:7132a78ee42f11b1e803dc16a3af40367c83ce70041fefabf7069d0152adfee1
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/case-model-case-resolution-build
files:
  - path: src/case/case-resolution.ts
    effect: answers the case's three declared operations from its declared hypotheses and fallback alone — collectionPlan() as the deduplicated union of every hypothesis's collects, requiresEvaluationOf() as one entry per declared hypothesis name, and resolveOutcome() as the first confirmed hypothesis in declared order with its outcome, referral and determining name, falling back with no determining name when none confirms — importing nothing but the aggregate's own types
criteria:
  - criterion: The collection plan is the deduplicated union of every hypothesis's collects.
    met: true
    how: collectionPlan() flattens every hypothesis's collects and passes the union through a Set, so each concept appears once however many hypotheses collect it
  - criterion: requires-evaluation-of answers what totality demands as the case declares it, one entry per declared hypothesis name.
    met: true
    how: requiresEvaluationOf() maps the case's hypotheses to their names, one entry each, exactly as the aggregate declares them — names the parse already holds unique within a case
  - criterion: Given confirmed and refuted verdicts per hypothesis name, resolve-outcome answers the first confirmed hypothesis in declared order with its outcome, its referral and its determining role.
    met: true
    how: resolveOutcome() walks theCase.hypotheses with find() — array order, which the parse keeps as the document's declared order — takes the first whose verdict is confirmed, and answers its resolution's outcome and referral with determining set to its name
  - criterion: A hypothesis confirmed after the determining one keeps its confirmed verdict, unmarked.
    met: true
    how: the verdicts record is only read, never written or copied back, and the answer carries no per-hypothesis marking of any kind — a later confirmation is simply not consulted after find() stops
  - criterion: When every hypothesis is refuted or inconclusive, resolve-outcome answers the fallback's outcome and referral.
    met: true
    how: when find() answers undefined — no verdict equals confirmed — resolveOutcome() answers theCase.fallback.outcome and theCase.fallback.referral
  - criterion: When the fallback answers, no determining hypothesis is named.
    met: true
    how: the fallback branch constructs the answer without the determining field at all, so no name is present rather than a name being null or empty
  - criterion: The declared order of the case's hypotheses is the only precedence resolution consults.
    met: true
    how: the one search is find() over the hypotheses array in its own order; nothing sorts, ranks, keys by name or reads any other field to choose among confirmations
  - criterion: The resolution modules import no framework, no driver and no provider client.
    met: true
    how: src/case/case-resolution.ts holds one import, the type-only ./case.js, and the existing purity audit over src/case sweeps every .ts in that directory, so the new module is held to both of its assertions automatically
nodes:
  - node: domain/knowledge/case
    encoded_at:
      - src/case/case-resolution.ts
    how: the three operations the node declares are the module's three exports, and its Responsibility sentence is their behavior; the aggregate's data side stays where the document-model task encoded it, untouched
  - node: domain/knowledge/hypothesis
    encoded_at:
      - src/case/case-resolution.ts
    how: each operation consumes exactly the attributes the node declares — collects feeds the collection plan, name is what requires-evaluation-of lists and what keys a verdict, and resolution is what the determining hypothesis answers with
  - node: domain/knowledge/resolution
    encoded_at:
      - src/case/case-resolution.ts
    how: the answer always carries one resolution's pair whole — the deciding position's outcome with its referral — so resolve-outcome can never answer one field without the other
  - node: domain/knowledge/referral
    encoded_at:
      - src/case/case-resolution.ts
    how: the answer's referral field is the deciding resolution's Referral value whole, action and recipient together
  - node: rules/knowledge/hypotheses-are-ordered-by-precedence
    encoded_at:
      - src/case/case-resolution.ts
    how: resolveOutcome() consults the hypotheses array in its own order and nothing else to choose the determining hypothesis, and the other two operations answer in that same order — the declared order the parse preserves is the one precedence in the module
  - node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
    encoded_at:
      - src/case/case-resolution.ts
    how: given a case declaring its hypotheses in order and verdicts confirming two of them, resolveOutcome() answers the earlier confirmed hypothesis's outcome and referral with determining as its name, and the later confirmed hypothesis keeps its verdict unmarked because the verdicts record is read-only to this module and the answer marks nothing
  - node: scenarios/knowledge/no-confirmation-falls-back
    encoded_at:
      - src/case/case-resolution.ts
    how: given verdicts in which every hypothesis is refuted or inconclusive, find() matches nothing, so the answer is the fallback's outcome and referral with no determining field constructed
  - node: constraints/the-domain-depends-on-no-infrastructure
    how: honored rather than encoded — the module's one import is the type-only ./case.js, and the operations are pure functions over values, unit-testable with no infrastructure stood up
inferences:
  - inferred: a verdict is one of the plain string values confirmed, refuted or inconclusive, supplied as a readonly record keyed by hypothesis name, and the answer is one plain value object of outcome, referral and determining name
    from: criteria 3 and 5 name exactly those three verdict states, both scenarios speak in them, and the task's seam decision stands that the investigation-context nodes live outside this task's candidates
  - inferred: no-determining-hypothesis is encoded as the determining field being absent from the fallback's answer, not as null or an empty string
    from: the scenario's then says no determining hypothesis is named, and an absent field is the encoding that names none at all
  - inferred: the collection plan's order is first appearance — each concept where the declared hypothesis order, and each hypothesis's own collects order, first names it
    from: no node states the plan's order; declared order is the aggregate's one ordering, which the parse already preserves
  - inferred: requires-evaluation-of answers the hypothesis names in declared order
    from: the criterion states one entry per declared hypothesis name without an order, and the declared order is the only order the aggregate carries
  - inferred: only an explicit confirmed verdict confirms — a hypothesis name the verdicts do not answer confirms nothing, and resolve-outcome neither refuses nor specially handles a non-total verdict set
    from: the task's seam decision — behavior over a non-total verdict set is the successor initiative's to define, so this module defines none, and the minimal reading is that nothing but a confirmed verdict determines
preserved:
  - the Case, Hypothesis, Resolution and Referral types and CASE_DOCUMENT_ENDING in src/case/case.ts, untouched — this task adds behavior beside the data
  - parseCaseDocument's refusals and its preservation of the document's declared hypothesis order, which resolve-outcome's precedence depends on, untouched
  - the module-purity audit over src/case, which the new module keeps true — no forbidden package, nothing but a relative import
  - the glossary, capability-registry, persistence and factory modules, none of which this task reaches
deferred:
  - what: nothing consumes the three operations yet — the read-case composition and the successor initiative's engine are their callers.
    why: wiring a consumer belongs to the tasks that own those seams
---
## What it is
The resolution logic the case owns, as three pure functions over the parsed aggregate: the plan, the totality list, and the precedence walk that gives the first confirmed hypothesis its determining role or falls back naming nothing.
Verdicts cross the seam as plain per-name values, exactly as the task's stand line bounds it.

## Notes
The non-total verdict set is deliberately undefined here: an unanswered name never determines, and what an incomplete evaluation set means is the successor initiative's rule to state — recorded as the inference that nothing but an explicit confirmed verdict determines.
The determining field is absent on fallback rather than null, because absence is the encoding that names nothing.
