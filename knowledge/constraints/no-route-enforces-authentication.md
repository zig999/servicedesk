---
statement: No route of the backend service is guarded by an authentication mechanism in this build; every request is accepted on the identity it claims, unverified, whoever the caller is.
scope: system
fitness: No route handler in the API layer declares or invokes an authentication middleware, guard or check; a request reaching any route is dispatched without one.
---

## Description

The requester's identity travels as a claim the caller supplies, never as one the service verifies — consistent with collection running in the requester's own authorization scope rather than the service's, and with the requester being taken directly from the request's own payload with no further resolution inside the domain. Nothing here is a domain rule about who may see what: it is the current state of the solution's own perimeter, standing until a later build decides otherwise.
What the frontend owes every user about this posture is `every-screen-discloses-that-authentication-is-unenforced`'s own, and it stands only while this one does. It was carried in this statement until the statement held two conditions and this fitness decided one of them: a fitness is what a step declaring this constraint is held to, so a clause standing outside it is a clause standing outside every check, and the check the disclosure does have was declared against a fitness that never named it.
