---
type: policy
statement: 'An operator on a surface that presents one registered capability, or that authors one for registration, is offered a route to the listing of registered capabilities, on every reading of that surface, and taking that route registers nothing: no capability is registered or replaced by it, and every capability currently registered stands exactly as it stood.'
expression: 'For an operator and a surface s presenting exactly one capability — one read by its own identity, name and version together, or one being authored for registration: the presentation of s carries a route whose destination is the listing of registered capabilities that contracts/integration/capability-registry''s list-capabilities answers. The route is present at every reading of s, and its presence is conditioned on nothing else: not on the state of the read backing s, whether that read completed, failed or answered no capability at that identity, and not on whether the capability s authors is already registered. Taking that route from s issues no register-capability call, so the set of capabilities currently registered is identical before and after, in membership and in every registration''s own declared contract. No property of the control carrying the route is evaluated — which control it is, its wording and where on s it sits are each unconstrained, and any affordance from which the operator reaches that listing satisfies this.'
constrains:
- domain/integration/capability
consistency: immediate
---

## Description

An operator authors capabilities directly — `domain/integration/_context` states holding what an operator registers directly, a capability among them — and reads one back by its own identity, name and version together: `read-capability-by-identity` was added to `contracts/integration/capability-registry` for exactly the surface addressed by a capability's own identity, which loads on first navigation or a page refresh without knowing which concept that capability currently answers.
The set those surfaces are reached from is the listing `list-capabilities` answers, one page at a time (`constraints/listings-are-paged`).
A surface addressed by one capability, or authoring one that no registration yet holds, is otherwise a terminus: no node said the operator gets back to the set from it, so whether an operator could return at all fell to whatever a surface happened to render.

That a route is owed where a reader stands one step from what they need is already this specification's own reading, and whether it is owed unconditionally, whatever the surface's own reading, is `a-capability-listing-routes-presence-turns-on-nothing-further`'s own.

Which control carries the route is form, not stated here: `every-screen-discloses-that-authentication-is-unenforced` already decided that the frontend owes the substance of what it tells every user and never a wording, on this project's own reading that a control's label or a screen's exact copy is surface while what a person can learn or do is not; `a-listed-case-version-offers-a-route-to-its-own-manifest` and `a-presented-case-version-states-its-own-declared-attributes` each close by putting which control carries a reading, its wording and where it sits with the interface. A surface carrying the route among its own actions and a surface carrying it as a standalone link above its heading are indistinguishable in what the operator can do, and this refuses to prefer either.

Taking it registers nothing.
`register-capability` is the one operation of `contracts/integration/capability-registry` that writes — creating a capability at a new name and version, or replacing whatever already stood at that identity with the whole declared contract submitted — so a route away that wrote what the surface was holding would make leaving indistinguishable from registering, over a write that is total.
The operator who takes this route has decided against the surface and not for a registration, and the destination is a read: the listing `list-capabilities` answers from what is currently registered.

Its reach is the registry's own surfaces and nothing beyond.
The route names no page of the listing: which page opens is `listings-are-paged`'s own answer, and this states only the destination.
This adds no attribute to `domain/integration/capability`, publishes no operation, refuses no call, and what may then be done through the listing stays where `capability-registry` and `a-capability-is-read-only` already put it.
What happens to content an authoring surface holds unwritten when the route is taken this decides nothing about.
Surfaces over any other subject — a connector configuration, a case, a hypothesis — are untouched: a route owed there would be its own fact about its own element.

Consistency is immediate because the route's presence follows from the surface's own subject alone, one capability, and from nothing read elsewhere; no fact here spans two reads.
