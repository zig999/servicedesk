---
title: Investigation, case and diagnose modules the subject/consolidation/diagnose rework lands in
summary: The investigation context (subject, observation-source port, factory, idempotency, evidence collection, drafting), the case aggregate and coherence validation, and the still-unbuilt diagnose composition — surveyed against the current, already-drifted specification text rather than the prior plan's record of it.
area:
  - src/investigation
  - src/case
  - src/factories
  - src/capability-registry
  - src/glossary
  - src/errors
  - src/persistence
  - src/__tests__/unit/investigation
  - src/__tests__/unit/case
modules:
  - name: subject
    path: src/investigation/subject.ts
    role: touched
  - name: observation-source-port
    path: src/investigation/observation-source.port.ts
    role: touched
  - name: fake-observation-source-adapter
    path: src/investigation/fake-observation-source.adapter.ts
    role: touched
  - name: investigation-factory
    path: src/investigation/investigation-factory.ts
    role: touched
  - name: investigation-aggregate
    path: src/investigation/investigation.ts
    role: touched
  - name: idempotency-key
    path: src/investigation/idempotency-key.ts
    role: touched
  - name: evidence-collection-stage
    path: src/investigation/evidence-collection-stage.ts
    role: touched
  - name: resolve-and-narrow-input
    path: src/investigation/resolve-and-narrow-input.ts
    role: touched
  - name: draft-assessment-text
    path: src/investigation/draft-assessment-text.ts
    role: touched
  - name: case-aggregate
    path: src/case/case.ts
    role: touched
  - name: parse-case-document
    path: src/case/parse-case-document.ts
    role: touched
  - name: validate-case-coherence
    path: src/case/validate-case-coherence.ts
    role: touched
  - name: idempotency-lease-store
    path: src/investigation/idempotency-lease-store.ts
    role: depends-on
  - name: idempotency-resolution
    path: src/investigation/idempotency-resolution.ts
    role: depends-on
  - name: judgment-stage
    path: src/investigation/judgment-stage.ts
    role: depends-on
  - name: hypothesis-evaluator-port
    path: src/investigation/hypothesis-evaluator.port.ts
    role: depends-on
  - name: fake-hypothesis-evaluator-adapter
    path: src/investigation/fake-hypothesis-evaluator.adapter.ts
    role: depends-on
  - name: investigation-store-port
    path: src/investigation/investigation-store.port.ts
    role: depends-on
  - name: case-resolution
    path: src/case/case-resolution.ts
    role: depends-on
  - name: capability-query-port
    path: src/capability-registry/capability-query.port.ts
    role: depends-on
  - name: glossary-query-port
    path: src/glossary/glossary-query.port.ts
    role: depends-on
  - name: composition-factories
    path: src/factories
    role: adjacent
  - name: investigation-errors
    path: src/errors
    role: adjacent
conventions:
  - statement: A domain-service tension between a house-style rule and a mechanical one is resolved by adapter behind a port (LLM in production, fake in test), never by a second criterion form in the schema — the exact resolution assessment-consolidator's own spec node says to reuse from hypothesis-evaluator.
    seen_at: src/investigation/hypothesis-evaluator.port.ts
  - statement: A '-modules.spec.ts' architecture-fitness test enumerates every .ts file directly under src/investigation/ (not just one task's own named files) and asserts no forbidden-package or standard-library import — any new file dropped into that directory, including an assessment-consolidator port/fake, is swept by the existing observation-source-modules.spec.ts check even though it predates that task.
    seen_at: src/__tests__/unit/investigation/observation-source-modules.spec.ts
  - statement: A '-modules.spec.ts' pinned to one task's own named files instead asserts "ships exactly one concrete class implementing the port" by scanning the whole directory for the "implements I<Port>" token — a pattern a new assessment-consolidator-modules.spec.ts should repeat rather than widen the shared directory-wide sweep.
    seen_at: src/__tests__/unit/investigation/hypothesis-evaluator-modules.spec.ts
  - statement: draft-assessment-text.ts is asserted, by its own fitness test, to import nothing from the case document module (case.js) at all, so no field there can carry a hypothesis's criterion or the case's when_to_use into drafting — reworking it to consume the consolidator's output must preserve that zero-import guarantee, not add a Case import to read consolidation_register.
    seen_at: src/__tests__/unit/investigation/draft-assessment-text-modules.spec.ts
  - statement: Every stage-level module (evidence-collection-stage, judgment-stage, idempotency-lease-store/resolution) takes now and deadline/windowMs as explicit parameters and never reads the system clock, so timing is exercised deterministically against fixture instants.
    seen_at: src/investigation/evidence-collection-stage.ts
  - statement: A pure domain module (case-resolution, resolve-and-narrow-input, draft-assessment-text, investigation-factory) imports nothing but this context's own sibling plain-data types and, at most, the case module — never a port, a client or the standard library.
    seen_at: src/investigation/investigation-factory.ts
  - statement: A totality/structural violation is collected into a list and thrown once as a single typed error naming every violation together, never thrown on the first violation found.
    seen_at: src/investigation/investigation-factory.ts
  - statement: A local, structurally-identical inline duplicate of a not-yet-canonical shared type (Subject) is left in place rather than refactored the moment the canonical module lands, with a comment naming the deferral and the delivery record that tracks it — the same tension the subject rework must resolve everywhere Subject is duplicated, not just in subject.ts.
    seen_at: src/investigation/observation-source.port.ts
  - statement: No diagnose entry point, HTTP layer or investigation-lifecycle composition factory exists anywhere in the tree yet — src/index.ts is still the empty compiler-substrate placeholder, and no factories/*.ts wires investigation, judgment, drafting or storage together.
    seen_at: src/index.ts
must_not_duplicate:
  - what: The port-plus-fake pattern for a domain service behind an interchangeable adapter (production LLM vs test fake, no second criterion form) — assessment-consolidator must follow this exactly, not invent its own shape.
    at: src/investigation/hypothesis-evaluator.port.ts and src/investigation/fake-hypothesis-evaluator.adapter.ts
  - what: The fixture-seeded fake convention (seed()/throw-on-unseeded-key, computing nothing from its inputs) for any new fake adapter.
    at: src/investigation/fake-observation-source.adapter.ts
  - what: The multi-field key-join convention (fields joined with '::' into one string) for any composite lookup key, including the reworked idempotency key over the subject's whole attribute set.
    at: src/investigation/idempotency-key.ts and src/investigation/fake-observation-source.adapter.ts's fixtureKey
  - what: The refuse-once-with-every-violation-named convention for structural/coherence checks, already used for both case parsing and case coherence — any consolidation_register structural check must reuse this shape rather than throwing on the first violation.
    at: src/case/parse-case-document.ts and src/case/validate-case-coherence.ts
  - what: The per-context factory composition convention (a thin function wiring one service from its leaf dependencies, each factory composing the ones below it) — a diagnose composition root should extend this, not start a second wiring convention.
    at: src/factories/case-query.factory.ts
  - what: The explicit now/deadline-as-parameters discipline (never reading the system clock internally) already shared by evidence-collection-stage, judgment-stage and idempotency-lease-store — any diagnose-entry-point wiring must keep it rather than reintroducing Date.now() at the top.
    at: src/investigation/evidence-collection-stage.ts, src/investigation/judgment-stage.ts and src/investigation/idempotency-lease-store.ts
risks:
  - risk: Subject's shape change (bare id -> type + set of attribute-value pairs) has a second, independently-declared inline copy that a naive rework could miss, since the observation-source port's own comment explicitly says its local Subject stands in for the canonical node and was deliberately left unrefactored by the prior task.
    consumers:
      - src/investigation/observation-source.port.ts
      - src/investigation/fake-observation-source.adapter.ts
      - src/investigation/evidence-collection-stage.ts
  - risk: idempotency-key.ts's own comment records a deliberate decision to keep subject type/id as two flat strings specifically because no canonical Subject module existed yet; the rework must revisit that documented reasoning, not just the type signature, or the key's own doc comment will misstate why it is shaped as it is.
    consumers:
      - src/investigation/idempotency-key.ts
      - src/investigation/idempotency-lease-store.ts
      - src/investigation/idempotency-resolution.ts
  - risk: "resolve-and-narrow-input.ts currently implements an older, now-superseded version of the-writing-input-is-narrowed (a confirmed/fallback split hiding case body): the current rule text requires unconditional breadth — every required hypothesis's evaluation (verdict, reason when present, citations) plus the evidence those citations name, in every outcome. Reworking the type shape without also dropping the confirmed/fallback branching leaves the module compiling against a rule it no longer matches."
    consumers:
      - src/investigation/draft-assessment-text.ts
      - src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
      - src/__tests__/unit/investigation/draft-assessment-text.spec.ts
  - risk: draft-assessment-text.ts currently drafts its own text deterministically from narrowedInput; switching it to consume assessment-consolidator's output changes its signature and removes its template logic, but its own fitness test asserts a zero-import guarantee against case.js that any rework must not silently break by reaching for the case to read consolidation_register instead of receiving it through the new input.
    consumers:
      - src/__tests__/unit/investigation/draft-assessment-text-modules.spec.ts
      - src/__tests__/unit/investigation/draft-assessment-text.spec.ts
  - risk: observation-source-modules.spec.ts sweeps every .ts file directly under src/investigation/ for forbidden-package and standard-library imports; a careless assessment-consolidator.port.ts or fake-assessment-consolidator.adapter.ts placed in that same directory inherits that check automatically, so an accidental stdlib import (e.g. crypto for a fixture key) fails a test that was not written with this task in mind.
    consumers:
      - src/__tests__/unit/investigation/observation-source-modules.spec.ts
  - risk: No diagnose entry point or composition factory exists yet — the prior plan's diagnose-entry-point task never shipped past its BLOCKING note. Threading requester/ticket_ref through a diagnose payload has no existing wiring code to amend; it is new composition, so any risk of it conflicting with a partially-built entry point is absent, but so is any existing pattern beyond the per-context factories to anchor it structurally.
    consumers:
      - src/factories
  - risk: case.ts's Case type is read by parse-case-document.ts (structural parsing), validate-case-coherence.ts (coherence checks) and case-resolution.ts (collectionPlan/requiresEvaluationOf/resolveOutcome); adding an optional consolidation_register touches the first two directly, and any code that spreads/reconstructs a Case verbatim (the held case in parse-case-document.ts) must be extended or the field is silently dropped on parse even though it is present in the raw document.
    consumers:
      - src/case/parse-case-document.ts
      - src/case/validate-case-coherence.ts
      - src/__tests__/unit/case/parse-case-document.spec.ts
      - src/__tests__/unit/case/validate-case-coherence.spec.ts
  - risk: investigation-factory.ts's BuildInvestigationOptions and Investigation both declare requester and ticket_ref as already-mandatory plain strings, copied straight through from options; wiring requester as required and ticket_ref as optional at the diagnose payload boundary must reconcile with this internal type, which currently has no optionality on ticket_ref at all.
    consumers:
      - src/investigation/investigation-factory.ts
      - src/investigation/investigation.ts
sources:
  - intake/scope.md
---

## What it is

The investigation, case and (still unbuilt) diagnose-composition area of `src/`, walked by following each module the scope names — subject, observation-source, the idempotency pair, evidence-collection-stage, the hypothesis-evaluator port pair as the pattern to mirror, resolve-and-narrow-input, draft-assessment-text, the case aggregate and its coherence validation — plus every sibling the fitness tests (`*-modules.spec.ts`) already couple to that same directory.
This is not greenfield: every touched module already carries a full delivery record from the closed `investigation-engine` initiative, several already flagged by that plan's own closure as drifted against specification text that has since moved (subject, idempotency, the-writing-input-is-narrowed).
No diagnose entry point, HTTP layer or investigation-lifecycle composition factory exists on disk yet; the prior plan's own diagnose-entry-point task never shipped past a BLOCKING note, so that piece is new composition work, not a rework of standing code.
The current specification text for the-writing-input-is-narrowed and an-investigation-is-idempotent-within-a-window already states the post-rework shape (unconditional breadth of every hypothesis's evaluation; the subject's whole attribute-value set in the idempotency key), confirming the code in resolve-and-narrow-input.ts and idempotency-key.ts implements an earlier version of both rules.

## Notes

assessment-consolidator, consolidation-register and consolidation-runs-behind-a-port are already-written specification nodes (knowledge/domain/investigation/assessment-consolidator.md, knowledge/domain/knowledge/consolidation-register.md, knowledge/constraints/consolidation-runs-behind-a-port.md); no corresponding source module exists yet under src/investigation/, so that whole port-plus-fake pair is new code following the hypothesis-evaluator pattern, not a rework.
domain/investigation/subject, domain/investigation/subject-attribute-value and domain/glossary/subject-attribute are already written with the post-rework shape (type + set of attribute-value pairs); src/investigation/subject.ts still declares the pre-rework bare-id shape, which is the trace drift the scope names.
The two *-modules.spec.ts fitness tests scoped to specific file lists (hypothesis-evaluator-modules.spec.ts, draft-assessment-text-modules.spec.ts) will need their own file lists extended or a sibling added for any new assessment-consolidator files; the directory-wide one (observation-source-modules.spec.ts) applies automatically and needs no edit to keep covering new files, only to keep passing against them.
No file under src/ currently mentions diagnose, requester handling at a boundary, or ticket_ref optionality — confirmed by a full-tree search; the diagnose payload rework has no existing consumer code to break beyond investigation-factory.ts's and investigation.ts's own already-mandatory requester/ticket_ref fields.
