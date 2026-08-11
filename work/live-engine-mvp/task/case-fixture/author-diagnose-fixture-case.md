---
title: Author a fictitious case and the vocabulary, capability and observation data it needs
summary: A file-backed case document, its glossary terms, its capability registrations and its canned observation outcomes, together sufficient to run one diagnose call end to end.
objective: A fictitious case document, valid whole against every current knowledge rule, exists on disk together with the glossary vocabulary, capability registrations and canned observation outcomes its own hypotheses need to run.
criteria:
  - The case document validates without a coherence violation when read through the knowledge context's own case-reading path against the fixture's own glossary and capability data.
  - The case declares at least one hypothesis, each with a non-empty criterion stating exactly one falsifiable claim, at least one collected concept, and a resolution pairing one outcome with one referral.
  - No two of the case's own hypotheses share a name, and the case's declared order is stated as its own precedence.
  - Every subject type, concept, outcome, action and recipient the case and its hypotheses name exists in the fixture's own glossary vocabulary files, and the glossary's outcome vocabulary also carries the two non-conclusion outcomes.
  - Every concept the case's hypotheses collect accepts the case's own declared subject type and has a registered read-only capability declaring an output schema and a timeout; at least one concept's registration states an explicit ttl.
  - The case's fallback declares its own resolution, distinct from any hypothesis's own.
  - The case declares an explicit consolidation register (formal or plain) rather than leaving it undeclared.
  - The case document is stored as one plain JSON document at <directory>/<slug>/1.json, its slug equal to the file's own name.
  - For every concept the case's hypotheses collect, a canned observation outcome exists, usable to seed a stand-in observation source so the whole pipeline can run against this case without a live corporate-records connection.
implements:
  - domain/knowledge/case
  - domain/knowledge/hypothesis
  - domain/knowledge/resolution
  - domain/knowledge/referral
  - domain/knowledge/consolidation-register
  - constraints/a-case-is-stored-as-one-json-document
  - rules/knowledge/a-case-has-at-least-one-hypothesis
  - rules/knowledge/a-collected-concept-declares-a-ttl
  - rules/knowledge/a-concept-accepts-the-declared-subject-type
  - rules/knowledge/a-hypothesis-collects-at-least-one-concept
  - rules/knowledge/a-hypothesis-declares-a-criterion
  - rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  - rules/knowledge/case-terms-exist-in-the-glossary
  - rules/knowledge/every-collected-concept-has-a-read-only-capability
  - rules/knowledge/every-position-declares-a-resolution
  - rules/knowledge/hypotheses-are-ordered-by-precedence
  - rules/knowledge/one-falsifiable-claim-per-criterion
  - rules/knowledge/the-slug-matches-the-file-name
  - domain/glossary/subject-type
  - domain/glossary/concept
  - domain/glossary/outcome
  - domain/glossary/action
  - domain/glossary/recipient
  - rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  - domain/integration/capability
  - domain/integration/capability-registry
  - domain/integration/capability-nature
  - contracts/investigation/observation-source
  - contracts/integration/corporate-records-source
  - domain/investigation/evidence-result
sources:
  - intake/scope.md
---

## What it is

One authored case, one set of matching vocabulary and capability records, and one set of canned observations.
Nothing here writes new production code; it is data the rest of this plan reads.

## Notes

rules/knowledge/a-collected-concept-declares-a-ttl's own second clause — a registration stating no ttl takes the sixty-second default — is a defaulting behavior applied at concept-registration time; this task only authors final glossary/concept files, which must already carry a ttl value by the concept's own schema, so no criterion here exercises that default path. It belongs to whatever curation tooling implements the registration workflow itself, not to this fixture-authoring task.
Criterion 6 (the fallback's resolution distinct from any hypothesis's own) is not stated as an invariant by any implemented node — domain/knowledge/case's own "a fallback claims nothing about the world" makes a distinct fallback the natural design, but nothing forbids a fixture whose fallback resolution equals a hypothesis's. The criterion is demonstrable by construction; author the fixture that way regardless.
Criterion 9's canned observation outcomes must be keyed and shaped by concept name plus a domain/investigation/evidence-result status — never by the corporate source system's own field names or structures. A fixture expressing observations in source-system vocabulary would satisfy the criterion's literal wording while contracts/integration/corporate-records-source's own confinement statement ("no source-system vocabulary crosses further in") refuses it.
