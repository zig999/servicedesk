---
title: A diagnosis runs against the database
summary: One diagnose call answered synchronously from the case, glossary and registrations the database holds, with the investigation written before the response and an error rather than an assessment when the write does not conclude.
rationale: The scope asks for the system delivered working end to end against the database, so the live path is work of this plan; it is cut apart from the wiring because a request path changes when what a run reads and writes changes, and a composition changes when what it constructs does. The deadline case is a criterion of this same task because persistence is the one stage the specification exempts from degrading, so it falsifies the same objective the ordinary answer meets.
sources:
  - intake/scope.md
depends_on:
  - task/service-on-the-database/store-wiring
  - task/case-authoring/curated-data-seeded
objective: A diagnose call over the seeded case is answered with the assessment in its own response, after its investigation has been written to the database.
criteria:
  - A diagnose call naming a case, a subject, a narrative and a requester, with an optional ticket reference, answers with an assessment carrying an outcome, a referral and a text.
  - The assessment returns in that call's own response, with no job, queue or polling between the caller and it.
  - The assessment's outcome, referral and determining hypothesis are exactly what the pinned case's resolve-outcome returned.
  - The response leaves whole and only after the investigation has been written.
  - When the persistence does not conclude within what remains of the deadline, the requester receives an error and not the assessment.
  - The investigation that call produced is readable from the store by its id after the response.
  - Every call runs the engine again, and no call answers with, reuses or joins an earlier investigation.
  - The case the run executed is the one pinned by slug and version at the start of that request.
  - The subject types and terms the record names are the ones the glossary holds at that run.
implements:
  - constraints/the-system-persists-to-one-relational-database
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

The whole path, over rows instead of files.
The attendant chooses a case, names the subject and the narrative, and receives an assessment within the deadline — recorded always.
The referral is exactly the part that is acted upon, which is why nothing is answered before the record exists.

## Notes

The inventory reports the single HTTP route is POST /v1/diagnose and that the HTTP layer reaches persistence only through ICaseQuery.
The inventory names src/src/__tests__/integration/http/diagnose-e2e.spec.ts as the existing end-to-end test this path is observed by.
The ticket reference is correlation for audit and never a matching key, so no criterion here reads a record back by it.
REMAINDER, from the specification — constraints/the-database-is-externally-provisioned reaches no criterion of this task; none of the nine address deployment topology, database-service declaration or connection configuration. It belongs to task/service-on-the-database/store-wiring, which reads the connection URL from configuration.
REMAINDER, from the specification — two clauses of constraints/the-system-persists-to-one-relational-database reach no criterion here even though the node is implemented for criterion 6: "one connection answers for every record" and "no record is held in a file the deployment ships or writes." They belong to task/service-on-the-database/store-wiring, which builds every factory from that connection and removes the file repositories.
