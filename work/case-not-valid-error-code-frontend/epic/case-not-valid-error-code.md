---
title: The error-code mapping answers the refusal the backend now sends
summary: The one correction to frontend/app/src/services/error-ui-state.ts, so a case version that fails
  validation at a read reaches the curator as itself rather than as the generic error.
covers:
- domain/glossary/concept
- domain/integration/capability
- domain/integration/connector-configuration
- domain/knowledge/hypothesis-revision
- domain/knowledge/hypothesis-revision-state
- rules/glossary/a-concept-declares-its-description
- rules/integration/a-capability-declares-well-formed-schemas
- rules/integration/a-capability-is-read-only
- rules/integration/a-connector-configuration-holds-a-well-formed-object
- rules/integration/one-capability-answers-one-concept
- rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
- rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
- rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
- scenarios/glossary/a-concept-with-no-description-is-refused
- scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
- scenarios/knowledge/releasing-an-already-released-revision-tells-the-curator-so
sources:
- intake/scope.md
rationale: A corrective increment gets its own epic rather than joining a delivered one, so no task an
  existing epic already holds is re-opened. The claim was seeded mechanically from what the trace says
  frontend/app/src/services/error-ui-state.ts already encodes, closed one hop, then grown to the two nodes
  the binder named after reading the candidates fresh — the seed reached neither, because the file's standing
  bindings are about concepts, capabilities, connector configurations and hypothesis revisions.
uncovered:
- node: domain/glossary/concept
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects; that file is the single mapping table every refusal passes through,
    so its bindings accumulated from unrelated deliveries. The binder read this node fresh and did not
    name it: nothing this correction writes touches what it states.'
- node: domain/integration/capability
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects; that file is the single mapping table every refusal passes through,
    so its bindings accumulated from unrelated deliveries. The binder read this node fresh and did not
    name it: nothing this correction writes touches what it states.'
- node: domain/integration/connector-configuration
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects; that file is the single mapping table every refusal passes through,
    so its bindings accumulated from unrelated deliveries. The binder read this node fresh and did not
    name it: nothing this correction writes touches what it states.'
- node: domain/knowledge/hypothesis-revision
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects; that file is the single mapping table every refusal passes through,
    so its bindings accumulated from unrelated deliveries. The binder read this node fresh and did not
    name it: nothing this correction writes touches what it states.'
- node: domain/knowledge/hypothesis-revision-state
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects; that file is the single mapping table every refusal passes through,
    so its bindings accumulated from unrelated deliveries. The binder read this node fresh and did not
    name it: nothing this correction writes touches what it states.'
- node: rules/glossary/a-concept-declares-its-description
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects; that file is the single mapping table every refusal passes through,
    so its bindings accumulated from unrelated deliveries. The binder read this node fresh and did not
    name it: nothing this correction writes touches what it states.'
- node: rules/integration/a-capability-declares-well-formed-schemas
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects; that file is the single mapping table every refusal passes through,
    so its bindings accumulated from unrelated deliveries. The binder read this node fresh and did not
    name it: nothing this correction writes touches what it states.'
- node: rules/integration/a-capability-is-read-only
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects; that file is the single mapping table every refusal passes through,
    so its bindings accumulated from unrelated deliveries. The binder read this node fresh and did not
    name it: nothing this correction writes touches what it states.'
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects; that file is the single mapping table every refusal passes through,
    so its bindings accumulated from unrelated deliveries. The binder read this node fresh and did not
    name it: nothing this correction writes touches what it states.'
- node: rules/integration/one-capability-answers-one-concept
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects; that file is the single mapping table every refusal passes through,
    so its bindings accumulated from unrelated deliveries. The binder read this node fresh and did not
    name it: nothing this correction writes touches what it states.'
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects; that file is the single mapping table every refusal passes through,
    so its bindings accumulated from unrelated deliveries. The binder read this node fresh and did not
    name it: nothing this correction writes touches what it states.'
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects; that file is the single mapping table every refusal passes through,
    so its bindings accumulated from unrelated deliveries. The binder read this node fresh and did not
    name it: nothing this correction writes touches what it states.'
- node: scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects; that file is the single mapping table every refusal passes through,
    so its bindings accumulated from unrelated deliveries. The binder read this node fresh and did not
    name it: nothing this correction writes touches what it states.'
- node: scenarios/knowledge/releasing-an-already-released-revision-tells-the-curator-so
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects; that file is the single mapping table every refusal passes through,
    so its bindings accumulated from unrelated deliveries. The binder read this node fresh and did not
    name it: nothing this correction writes touches what it states.'
---

## What it is
The single epic of a corrective increment over the frontend's mapping from an API error code to a user-facing state.
It claims what the trace already says the file it corrects encodes, seeded by `trace.py --encodes` and closed one hop, and answers for every one of those nodes either through its task or through a stated why.

## Notes
The seed is mechanical and is not a reading: the eight bindings the trace holds on this file accumulated from deliveries about concepts, capabilities, connector configurations and hypothesis revisions, because the file is one central mapping table every refusal passes through.
None of them is the node governing the behavior this increment corrects, which is why the claim is expected to grow once the binder has read the candidates.
The claim grew after the binder returned: the two nodes it named sat outside the seeded covers, so the epic's claim was grown to them and the binder re-run, rather than the task's own reference being widened by hand.
