---
type: policy
statement: Registering concepts adds a concept at a new name or replaces the concept already held at that name, and removes no concept already held; removing a concept by name succeeds unless a registered capability answers it, a collected evidence item or its citation names it, or a hypothesis-revision's own collects lists it, in which case the removal is refused and the concept is never removed from the glossary any other way.
constrains:
  - domain/glossary/concept
  - domain/integration/capability
  - domain/investigation/evidence
  - domain/investigation/citation
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

A concept, once registered, is load-bearing the moment anything else names it: a capability answers it, a collected evidence item or its citation identifies an observation by it, or a hypothesis-revision's own collects lists it — and case-terms-exist-in-the-glossary already requires that name to keep existing for as long as the hypothesis-revision or case version that named it does. Removing it would strand every one of those references. Registering a batch of concepts is never a reason to remove one the batch does not mention.
An explicit removal by name is refused under the same conditions: a concept nothing yet names is removed outright, and glossary-authoring's own remove-concept is the one operation that ever removes a registered concept at all.
