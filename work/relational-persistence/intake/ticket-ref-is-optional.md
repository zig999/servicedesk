Corrective increment — one wrong behavior observed in code already delivered, answering to no task's criteria. Surfaced by /reconcile's own conformance judgment (three independent passes, majority vote), not by running the delivered system directly.

Route: /plan-work's corrective path (no survey, no decomposition). Target: backend (src). Initiative: relational-persistence (live work root).

Scope, as the human stated it:

investigation-factory.ts's BuildInvestigationOptions.ticket_ref, investigation.ts's
Investigation.ticket_ref, and run-diagnosis.ts's RunDiagnosisOptions.ticket_ref are all typed as a
required, non-optional string. domain/investigation/investigation gives ticket_ref no
`required: true` — unlike every other attribute except the deliberately-optional
consolidation_register — and its own Description states plainly: "requester and ticket_ref both
arrive in the diagnose call itself; requester is always given, ticket_ref is not — not every
diagnose call carries a ticket." contracts/investigation/diagnosis describes the entry as taking
"case, subject, narrative and requester in, with an **optional** ticket reference." The human
confirmed directly: ticket_ref is optional, not required — the specification is correct, the code
is not.

Fix: type `ticket_ref` as optional (`ticket_ref?: string`) in all three places — BuildInvestigationOptions,
Investigation, and RunDiagnosisOptions — and thread the absence through rather than requiring every
caller to invent a placeholder value.

This was surfaced by /reconcile's own conformance judgment over the same 13-file set reconciled once
before (siegard-reconcile/case-and-investigation-post-hash-fix-round-2.md) — 2 of 60 bound nodes did
not clear, both for this one underlying reason. The finding itself came from a disagreement between
independent judgment passes over the identical, unchanged source: a first pass explicitly considered
this shape and called it "an imprecision in typing discipline rather than a stated domain fact"; two
later, independent passes (one blind to the first, one a deliberate tie-break blind to both) each
called it a real departure. By the human's own instruction that majority among three passes decides,
this stood as 2-of-3 before the human then confirmed it directly.

It answers to no task's criteria: the tasks that delivered these three files
(case-and-investigation-model's own investigation-record-shape, and whichever task most recently
touched run-diagnosis.ts) were delivered and reviewed before this was found.
