---
title: ticket_ref becomes optional, matching what the specification already states
summary: BuildInvestigationOptions.ticket_ref, Investigation.ticket_ref and RunDiagnosisOptions.ticket_ref stop being required, non-optional strings, so the code can represent a diagnose call that carried no ticket, exactly as domain/investigation/investigation and contracts/investigation/diagnosis already say most calls do.
sources:
  - intake/ticket-ref-is-optional.md
objective: "investigation-factory.ts's BuildInvestigationOptions, investigation.ts's Investigation, and run-diagnosis.ts's RunDiagnosisOptions all type ticket_ref as optional, and the absence threads through rather than requiring a caller to invent a placeholder value."
criteria:
  - "BuildInvestigationOptions.ticket_ref, Investigation.ticket_ref and RunDiagnosisOptions.ticket_ref are each typed as an optional string (ticket_ref?: string), not a required one."
  - "buildInvestigation, given no ticket_ref, builds an Investigation that itself carries no ticket_ref (undefined, or the field genuinely absent) rather than an invented placeholder value."
  - "Every real caller of runDiagnosis and buildInvestigation that already supplies a ticket_ref keeps working unchanged."
implements:
  - domain/investigation/investigation
---

## What it is

The reconciliation between a majority-confirmed conformance finding and the source it flagged: three files still require a ticket reference the specification has never required, confirmed by the human directly (ticket_ref is optional, not required) after two of three independent judgment passes over the same code already agreed.

## Notes

REMAINDER, from the specification — the objective and criterion 1 also require RunDiagnosisOptions.ticket_ref (run-diagnosis.ts) to become optional. That fact is stated by contracts/investigation/diagnosis ("case, subject, narrative and requester in, with an optional ticket reference"), which sits in epic/service-on-the-database's own covers, not in this epic's. Nothing in this task's candidates reaches the entry-point's own input contract, so the RunDiagnosisOptions half of the objective and of criterion 1 is not implemented against anything in this epic's scope.
Decision, beyond the covers — stand: contracts/investigation/diagnosis is named only to identify where the RunDiagnosisOptions half of this fix is backed; the underlying fact (ticket_ref is optional) is already fully established by domain/investigation/investigation, which this task does implement, and run-diagnosis.ts's own type is corrected here as the same fact propagated into a third file rather than a second, independent domain claim — splitting one two-line, single-fact fix across two epics' worth of ceremony would cost more than the departure.
