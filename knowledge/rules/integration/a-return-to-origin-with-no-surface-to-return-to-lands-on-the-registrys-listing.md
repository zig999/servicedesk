---
type: policy
statement: >-
  Where no surface the act a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
  states was reached from exists — its own address having been opened directly, or reloaded at
  that address — and the surface holds no entry the operator has composed and not submitted,
  that act lands the operator on the listing of the registry whose registration the surface
  presents: the listing of registered capabilities from a surface keyed on a name and version,
  and the listing of registered connector configurations from a surface keyed on a connector
  name, leaving them neither on that surface nor on a read keyed on the name and version or the
  connector name the surface presents, and registering nothing there either.
constrains:
  - domain/integration/capability
  - domain/integration/connector-configuration
consistency: eventual
---

## Description

This states one act, not a second one beside the abandonment. Where the operator holds an entry on such a surface, `an-abandoned-capability-registration-entry-registers-nothing` and `a-connector-configuration-authoring-may-be-abandoned-without-registering` already state that leaving it registers nothing and lands the operator on the surface the authoring was reached from; this is that act, with that destination, extended to the readings on which there is no entry to abandon.

The destination this act names is the surface the operator was reached from, and on a surface reached from nothing that phrase names nothing at all. That is the silence `an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing` closed for an authoring surface left without registering, met again on the readings stated here, where there is no entry to leave without registering and that rule's own predicate binds nothing. It is not an edge of these registries: `read-capability-by-identity` and `read-connector-configuration` were published for surfaces addressed by an identity and by a connector name, which load on first navigation and on a page refresh, so an operator opens one of these surfaces at its own address or reloads it as a matter of course, and on exactly those readings there is no surface to be landed on.

The listing answers, which is the property this destination has to have: `list-capabilities` and `list-connector-configurations` answer from what is currently registered and, under `constraints/listings-are-paged`, answer a page carrying a total — zero where nothing is registered — rather than refusing, while a destination keyed on the name and version or the connector name the surface presents is refused by `constraints/the-capability-identity-read-refuses-an-unregistered-identity` and `a-connector-configuration-read-by-an-unregistered-name-is-refused` on one of the very readings stated here, the reading whose read answered that nothing is registered there. Landing the operator back on the surface is refused for the reason the sibling rule already gives — no operator is left on a surface the act was supposed to take them off, and staying is already a different act, `a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface`, which owes a further explicit act this does not — and because an act whose whole effect is to land the operator somewhere would, on these readings, have no effect at all. Nothing is lost by the listing: `a-single-capability-surface-offers-a-route-to-the-capabilities-listing` and `a-connector-configuration-surface-offers-a-route-to-the-listing` owe a route to that same listing on every reading of this surface regardless, and the paging objection `a-successful-capability-registration-lands-on-the-capabilitys-own-surface` and `a-successful-connector-registration-lands-on-the-configurations-own-surface` raise against the listing does not reach an act that registers nothing and leaves no registration that has to be in view.
