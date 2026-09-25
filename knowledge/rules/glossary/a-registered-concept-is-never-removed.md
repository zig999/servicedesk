---
type: policy
statement: Registering concepts adds a concept at a new name or replaces the concept already held at that name, and removes no concept already held; removing a concept by name succeeds unless a registered capability answers it, a collected evidence item or its citation names it, or a hypothesis-revision's own collects lists it, in which case the removal is refused with an HTTP 409 response reporting a ConceptInUseError that reports, for the concept found still named, a reference identifying what names it — capability where a registered capability answers it, evidence where a collected evidence item names it, citation where a citation names it, and hypothesis-revision-collects where a hypothesis-revision's own collects lists it — and the concept is never removed from the glossary any other way; a concept's removal takes that concept's own declaration of the subject types it accepts with it and removes no term of the subject-type vocabulary, whose terms are held independently of the concepts that accept them.
constrains:
  - domain/glossary/concept
  - domain/glossary/subject-type
  - domain/integration/capability
  - domain/investigation/evidence
  - domain/investigation/citation
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

A concept, once registered, is load-bearing the moment anything else names it: a capability answers it, a collected evidence item or its citation identifies an observation by it, or a hypothesis-revision's own collects lists it — and case-terms-exist-in-the-glossary already requires that name to keep existing for as long as the hypothesis-revision or case version that named it does. Removing it would strand every one of those references. Registering a batch of concepts is never a reason to remove one the batch does not mention.
An explicit removal by name is refused under the same conditions: a concept nothing yet names is removed outright, and glossary-authoring's own remove-concept is the one operation that ever removes a registered concept at all. The refusal does not merely say the concept is in use: it names which of those conditions was found, so the person told to keep the concept knows what to look at.
The subject types a concept accepts are not a reference of that stranding kind: the declaration is made inside the concept and has no reader once the concept is gone, while the names it uses belong to a vocabulary registered for every case version and concept that may speak a term rather than for the concept that happened to accept it.
