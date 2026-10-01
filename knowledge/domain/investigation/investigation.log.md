---
entries:
- field: attributes.id.type
  unstated: The material lists id without a shape.
  decided: string
  why: Nothing in the material orders or computes over ids; an opaque string is the weakest sufficient claim.
- field: attributes.requester.type
  unstated: The material names the requester and their authorization scope without a shape.
  decided: string
  why: The requester is an identity carried to the connectors for scoping; an opaque identifier suffices and the scope itself lives with authorization, not the domain.
- field: attributes.requester.type
  unstated: No node stated where a diagnose call's requester value originates — the standing BLOCKING on task/investigation-lifecycle/diagnose-entry-point.
  decided: The caller supplies it directly in the diagnose call's own payload; no further resolution or inference happens inside the domain.
  why: Resolves the standing BLOCKING; the human confirmed the caller supplies it directly, the same way ticket_ref now does.
- field: attributes.ticket_ref.required
  unstated: The same BLOCKING left unstated where ticket_ref originates, and whether every diagnose call must carry one.
  decided: Not required — ticket_ref travels in the diagnose call's own payload when given, but not every call carries one.
  why: The human confirmed a ticket reference is optional; nothing forces every request to have a ticket to attach.
- field: attributes.ticket_ref
  unstated: Removing the window-deduplication rule deletes the only node that gave ticket_ref an operative role, and the node itself does not say why the attribute survives.
  decided: ticket_ref stays on the investigation, optional and unchanged — correlation with the ticketing system for traceability and audit, participating in no matching or deduplication logic.
  why: The product owner confirmed the attribute keeps its correlation value with repetition semantics gone; removing it would cut the audit link between an investigation and the ticket that occasioned it, which nothing in the removal asked for.
- field: attributes
  unstated: The material does not say whether an investigation records when it was written; the file's own modification time carried it by accident and a row carries nothing by accident.
  decided: written_at, a required datetime.
  why: The record exists to be audited and replayed, and when it was written is the one fact an audit cannot recover from any other attribute; it is not a closing state, because nothing reads it to decide whether the investigation finished and there is no value it moves to next.
---
