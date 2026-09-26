---
type: policy
statement: >-
  Delete, asked of a case that holds no case version, is accepted and removes the case;
  asked of a case holding any version, draft or released, it is refused with an HTTP 409
  response reporting a CaseHoldsVersionsError, whose message names the case slug and whose
  details carry that slug and nothing else.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
consistency: eventual
---

## Description

`only-a-draft-case-version-may-be-discarded` never removes a released version, so a case that has ever been released always keeps that version standing — a case reaches zero versions only where every draft it ever held was discarded before release. `only-a-released-case-version-is-diagnosed` pins an investigation to nothing but a released version, so a case that has reached zero versions is a case no investigation has ever been able to pin. "Holds no case version" is therefore not a convenience narrowing of a harder question about investigations; it already is that question, decided in the case's own store and needing no second table read.

Delete answers a case discard never reaches: `only-a-draft-case-version-may-be-discarded` and `a-case-version-number-is-never-reused` let a curator empty a case of its one draft while the case itself, its slug and its next_version counter, stand exactly as `domain/knowledge/case`'s own Description requires them to survive that. What they leave behind is an identity naming nothing — the state `a-case-holding-no-versions-is-told-explicitly` already requires this specification to say plainly rather than let an empty listing pass unremarked. Delete is the further act that ends that identity itself, where a curator or an operator judges it is not worth keeping.

Once deleted, the case's slug names no case, and `a-case-is-created-by-the-first-create-draft-naming-its-slug` already answers a create-draft naming a slug no case holds by creating a new case under it — a deleted case's slug is claimed by a future case exactly as if the deleted one had never existed, with no rule of its own needed to say so. `a-slug-identifies-one-case` continues to hold: at any instant, at most one case answers to a slug, deleted or not.
