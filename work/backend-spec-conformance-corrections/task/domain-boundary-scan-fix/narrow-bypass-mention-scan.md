---
title: Domain-boundary scan stops flagging a legitimate specification-node citation
summary: The nine domain-depends-on-no-infrastructure.spec.ts's bypass-mention scan for "http-connector" no longer matches the substring inside a cited specification-node identity, while still catching a real reference to the http-connector module.
objective: domain-depends-on-no-infrastructure.spec.ts's own domain-boundary scan continues to refuse a real reference to the http-connector module from outside its one legitimate adapter, and stops refusing the substring "http-connector" appearing only as part of a specification-node identity cited in a comment.
criteria:
  - Given src/investigation/observation-source.port.ts's own existing comment citing rules/integration/an-http-connector-configuration-declares-its-call, unchanged, the domain-boundary suite test no longer reports this file as an offender.
  - Given a domain module outside the one legitimate HTTP adapter that imports from, or otherwise textually references, the actual http-connector module (not merely a specification-node identity containing that substring), the same test still reports it as an offender.
rationale: A corrective increment answering to no criterion any task holds — the defect was observed by running the delivered suite three times, in three deliveries of this same initiative, each independently diagnosed by failure-diagnostician as cause test, a false positive with no real coupling.
implements:
  - constraints/the-domain-depends-on-no-infrastructure
sources:
  - intake/2026-08-26-domain-boundary-substring-scan-false-positive.md
---

## What it is

A corrective increment: one wrong behavior observed by running the delivered suite three times, answering to no criterion of any task under this initiative's own plan.

## Notes

None.
