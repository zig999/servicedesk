---
target: frontend
title: Invalidate the concepts cache on a successful concept removal
summary: useRemoveGlossaryConcept now invalidates the ["glossary","concepts-with-ttl"]
  query on HTTP 204, so the concepts listing drops the removed row while the operator
  stays on the glossary's concepts tab.
task: sha256:267c9230ddc76c08d34c9179708c780b8d835ad6648141ac1b99b568dc0588b1
files:
- path: src/hooks/use-glossary-concepts.ts
  effect: useRemoveGlossaryConcept now calls useQueryClient() and, in onSuccess, invalidates
    the ["glossary","concepts-with-ttl"] query key.
criteria:
- criterion: After a removal answered with HTTP 204, the glossary shows its concepts
    tab.
  met: true
  how: No code path changes this; ConceptsPanel is rendered inside the Tabs component's
    "concepts" TabsContent (defaultValue="concepts"), and neither useRemoveGlossaryConcept
    nor ConceptsPanel navigates anywhere.
- criterion: After a removal answered with HTTP 204, the concepts listing shows no
    row for the removed concept's name.
  met: true
  how: onSuccess invalidates ["glossary","concepts-with-ttl"], the key useGlossaryConcepts
    reads its rows from.
nodes:
- node: rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing
  encoded_at:
  - src/hooks/use-glossary-concepts.ts
  how: The destination is already the concepts listing by construction (remove-concept
    is issued from the listing itself); this task makes the listing actually reflect
    the removal via invalidation. Capability and connector-configuration clauses are
    out of reach.
- node: constraints/a-successful-concept-removal-answers-with-no-content
  encoded_at:
  - src/hooks/use-glossary-concepts.ts
  how: Reacts to the HTTP 204 the constraint guarantees; does not implement the response
    itself.
- node: domain/glossary/concept
  encoded_at:
  - src/hooks/use-glossary-concepts.ts
  how: The invalidated query key is the cache of this value object's own listing;
    no attribute is read or changed.
preserved:
- useGlossaryConcepts' own query key and shape stay unchanged.
- useRemoveGlossaryConcept's public shape ({remove, isRemoving}) is unchanged.
- No navigation behavior is added or removed.
deferred:
- what: Landing capability and connector-configuration removals on their own listings.
  why: Owned by the sibling landing tasks.
- what: Stating the removal's outcome to the operator.
  why: Owned by the outcome-disclosure task.
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/concept-removal-concept-removal-landing-build
---

## What it is
Invalidates the concepts listing cache on a successful concept removal, so the removed row disappears while the operator stays on the concepts tab.

## Notes
None.
