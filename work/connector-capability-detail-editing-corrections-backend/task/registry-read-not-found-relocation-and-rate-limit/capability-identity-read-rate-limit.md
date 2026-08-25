---
title: Rate limit on the capability-by-identity read route
summary: The read-capability-by-identity route refuses more than 60 requests per minute from one source IP, with an HTTP 429 naming when the caller may retry.
sources:
  - intake/scope.md
objective: The read-capability-by-identity route refuses a caller's requests beyond 60 per minute, identified by the request's source IP address, with an HTTP 429 response naming when the caller may retry, applied to this one route alone.
criteria:
  - A 61st request within one minute from the same source IP to read-capability-by-identity receives HTTP 429.
  - That HTTP 429 response carries a Retry-After value naming when the caller may retry.
  - Up to and including the 60th request within the same minute from that source IP still receives its ordinary, non-429 response.
  - A request from a different source IP within the same minute is not counted against another source IP's limit.
  - No route other than read-capability-by-identity is registered against the rate-limit mechanism this task adds, and every other existing route's tests continue to pass unmodified.
implements:
  - constraints/the-capability-identity-read-is-rate-limited
---

## What it is

createReadCapabilityByIdentityRoutesPlugin gains a rate-limit check, scoped to its own registration or a plugin only this route uses, ahead of the existing handler.
A caller identified by source IP, past 60 requests in a minute, is answered 429 with Retry-After instead of reaching the handler.
No shared rate-limit plugin is introduced for any other route.

## Notes

constraints/no-route-enforces-authentication is why the caller here is identified by source IP rather than a verified identity: no route in this build verifies one.
No rate-limiting package is currently declared in src/package.json; this task's own delivery is where that dependency, if needed, is added.
constraints/the-capability-identity-read-refuses-an-unregistered-identity governs the same route but a distinct concern (its 404/CapabilityIdentityNotFoundError refusal for an unregistered name and version); none of this task's criteria, all scoped to the 429 rate-limit behavior, touch that refusal.
REMAINDER, from the specification — rules/integration/a-connector-configuration-is-tested-through-a-registered-capability's statement reaches none of this task's criteria, which are entirely about rate-limiting read-capability-by-identity. Belongs to task/registry-read-not-found-relocation-and-rate-limit/capability-not-found-relocation.
REMAINDER, from the specification — rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused's statement reaches none of this task's criteria, which are entirely about rate-limiting read-capability-by-identity. Belongs to task/registry-read-not-found-relocation-and-rate-limit/connector-configuration-not-found-relocation.
