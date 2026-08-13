---
title: The service runs end to end on the database
summary: The wiring from environment to the four relational stores with no file left holding a record, and one diagnose call answered synchronously from the database with its investigation written before the response.
rationale: The scope asks for the system working end to end against the database, so the wiring and the live path are cut as work of this plan rather than left as a consequence of the adapters; they are two tasks because a composition changes when what it constructs changes, and the request path changes when what a run reads and writes does. The claim was too thin to carry the live path, and it now names the published diagnose operation and the conditions on its answer, which is what a request-level criterion rests on.
sources:
  - intake/scope.md
covers:
  - constraints/the-system-persists-to-one-relational-database
  - constraints/the-database-is-externally-provisioned
  - constraints/diagnosis-answers-synchronously
  - contracts/investigation/diagnosis
  - contracts/system/guided-diagnosis
  - contracts/investigation/case-source
  - contracts/investigation/glossary-source
  - rules/investigation/the-outcome-comes-from-the-case
  - rules/investigation/the-response-follows-the-record
  - scenarios/investigation/no-response-without-a-record
  - domain/investigation/investigation
  - domain/investigation/assessment
---

## What it is

The composition a deployment enters through, rebuilt around one connection.
Every factory constructs its store from that connection, the environment names no directory, and the file repositories leave the tree.
Over that composition, one diagnose call runs the case the knowledge context published, writes its investigation, and only then answers the attendant with the assessment.

## Notes

The composed wiring chain the inventory names — src/src/factories/diagnose-server.factory.ts, case-query.factory.ts and production-diagnose.factory.ts — is the chain this epic changes, and the single environment schema at src/src/config/env.ts is where the connection URL is added rather than read separately.
The externally-provisioned constraint is claimed here and by epic/relational-substrate: the connection module reads the URL from configuration, and the wiring is where nothing else may.
Persistence is the one stage the specification exempts from degrading, which is why the deadline case belongs to the same task as the ordinary answer.
