---
target: backend
title: Concept-usage reader — capability, evidence, citation and unmanifested-collects resolution
summary: Integration tests against the real database prove each of the four reference kinds the reader
  answers, its negative and manifested-exclusion cases, and its fixed capability-first check order, alongside
  a unit test proving the glossary port carries zero imports.
implementation: sha256:f12e63dffe8a1c59d074ae9be9b68d507aa6ee1f09a7e1f383d0155a494270a3
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/cross-context-usage-reads-concept-usage-reader-suite
tests:
- file: src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts
  name: answers that a concept is named, through reference "capability", when a registered capability
    answers that exact concept
  proves: Criterion 1 — a registered capability whose own concept is the queried name is answered as named,
    with reference 'capability'.
  fails_when: 'readConceptUsage(concept) answers anything other than { named: true, reference: ''capability''
    } once a capability has been registered against that exact concept.'
- file: src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts
  name: answers that a concept is named, through reference "evidence", when a stored evidence item records
    that exact concept and no capability answers it
  proves: Criterion 2 — a stored evidence item recording the queried concept is answered as named, with
    reference 'evidence', when no capability answers it.
  fails_when: 'readConceptUsage(concept) answers anything other than { named: true, reference: ''evidence''
    } once a real investigation has been written with an evidence item naming that exact concept and no
    capability names it.'
- file: src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts
  name: answers that a concept is named, through reference "citation", when a stored evaluation citation
    records that exact concept and no stored evidence item does
  proves: Criterion 3 — a stored evaluation citation recording the queried concept, with no stored evidence
    item recording it, is answered as named, with reference 'citation'.
  fails_when: 'readConceptUsage(concept) answers anything other than { named: true, reference: ''citation''
    } once a real investigation''s evaluation cites that exact concept while no evidence item names it.'
- file: src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts
  name: answers that a concept is named, through reference "hypothesis-revision-collects", when a hypothesis-revision's
    own collects lists that exact concept and no case version manifests that revision
  proves: Criterion 4 — a hypothesis-revision whose own collects lists the queried concept, unmanifested
    by any case version, is answered as named, with reference 'hypothesis-revision-collects'.
  fails_when: 'readConceptUsage(concept) answers anything other than { named: true, reference: ''hypothesis-revision-collects''
    } once a real hypothesis-revision has been inserted collecting that exact concept and never placed
    into any case version''s manifest.'
- file: src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts
  name: answers that a concept is not named when nothing answers, records, cites or collects it
  proves: Criterion 5 — a concept nothing references at all is answered as not named.
  fails_when: 'readConceptUsage(concept) answers { named: true, ... } for a freshly-registered concept
    that no capability, evidence item, citation or hypothesis-revision touches at all.'
- file: src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts
  name: answers that a concept is not named when a hypothesis-revision's own collects lists it but a case
    version already manifests that revision
  proves: The qualifier inside criterion 4 — 'which no case version manifests' — actually excludes a manifested
    hypothesis-revision's own collects.
  fails_when: 'readConceptUsage(concept) answers { named: true, reference: ''hypothesis-revision-collects''
    } once the collecting hypothesis-revision has been placed into a real case version''s manifest.'
- file: src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts
  name: answers reference "capability", never "evidence", when both a registered capability answers the
    concept and a stored evidence item also records it
  proves: Criterion 6 — the reader reports exactly one of the four kinds it found, deterministically,
    for a concept both a capability and a stored evidence item name at once.
  fails_when: readConceptUsage(concept) answers 'evidence' (or anything other than 'capability') when
    both a real registered capability and a real stored evidence item name the same concept simultaneously.
- file: src/__tests__/unit/glossary/concept-usage-reader.port.spec.ts
  name: declares IConceptUsageReader and its resolution types with no import statement at all, so the
    glossary module reaches no database driver, framework or provider client through this file
  proves: Criterion 7 (the port carries no database-driver import) as literally stated, and closes the
    underdetermined entry over constraints/the-domain-depends-on-no-infrastructure by asserting zero imports
    of any kind.
  fails_when: concept-usage-reader.port.ts carries any import statement at all — a database driver, a
    framework, a DI container or a provider client alike.
not_applicable:
- edge_case: Concurrent or overlapping calls to readConceptUsage
  why: No criterion states a concurrency behavior for this reader; it performs no write, so there is no
    race to arbitrate here.
- edge_case: The database, or the injected ICapabilityQuery, being unavailable, slow, or answering unexpectedly
  why: No criterion in this task states a refusal or a degraded answer for a failing dependency; each
    store's own error-wrapping is already proven by its own integration suite.
- edge_case: An absent, empty, or otherwise malformed concept string reaching readConceptUsage
  why: No criterion in this task validates its input; the implementation record's own deferred entry places
    the guard's consuming operation, including boundary validation, on the remove-concept operation task.
- edge_case: A concept answered by two registered capabilities at once (DuplicateConceptAnswerError)
  why: readConceptUsage delegates straight to the already-existing ICapabilityQuery.readCapability, whose
    own duplicate-resolution behavior is already proven and untouched by this task.
untested:
- domain/integration/capability — this task adds no new attribute or behavior to the capability aggregate;
  it only calls the already-existing ICapabilityQuery.readCapability(concept). The node's own whole fact
  is established and proven by the capability-registry module's own suite.
- domain/investigation/evidence — this task's own encoding reads only the concept column's presence; the
  node's whole fact (inputs, observation, ttl, origin, result, elapsed_ms and the degradation rules) is
  not touched here.
- domain/investigation/citation — this task's own encoding reads only the concept column's presence; the
  node's whole fact (the concept+field pair and the field-presence rule) is never touched by this task.
- domain/knowledge/hypothesis-revision — this task's own encoding reads only whether a collects row exists
  with no matching manifest entry; the node's whole fact (revision numbering, criterion, resolution, release,
  immutability) is untouched here.
- constraints/the-domain-depends-on-no-infrastructure — its own statement and fitness are system-wide,
  over every domain module; the one test this task adds only decides the zero-import property of this
  one new port file, never the whole cross-module audit.
- The check-order test exercises only the capability-over-evidence pairing; the remaining five pairwise
  orderings all exercise the identical sequential if/else-if mechanism the one tested pairing already
  establishes, so the specific priority chosen beyond that one pairing remains this implementation's own
  unproven choice.
---

## What it is
The tests proving concept-usage-reader: each of the four positive reference kinds against the real database, the negative case, the manifested-revision exclusion, the fixed capability-first check order, and the port's own zero-import boundary.

## Notes
The build hit a transient infrastructure timeout connecting to the lab Postgres instance on its first two attempts (run/cross-context-usage-reads-concept-usage-reader-build, -build-2), unrelated to this task's code — typecheck/lint/secret-scan passed on both. The third attempt (run/cross-context-usage-reads-concept-usage-reader-build-3), run once connectivity was restored, passed cleanly including test-unit.
