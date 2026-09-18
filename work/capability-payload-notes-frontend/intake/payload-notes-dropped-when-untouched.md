# Scope — corrective increment

Wrong behavior: both use-capability-form.ts's and use-capability-detail.ts's submitted PUT
bodies include payload_notes only when react-hook-form's dirtyFields.payload_notes is true.
Every other declared attribute is forwarded unconditionally from the form's current value. An
operator who loads a capability that already carries payload notes, edits some other field
(e.g. connector) without touching the payload notes textarea, and submits, sends a PUT body
with no payload_notes key at all — and since register-capability replaces whatever stood at
the identity with the whole declared contract submitted, the capability's existing payload
notes are silently erased even though the operator never declared or cleared them.

Reproduction: open the detail surface for a capability that already has payload_notes set;
change the connector field only; save. The capability's payload_notes is now gone.

Files: src/hooks/use-capability-form.ts, src/hooks/use-capability-detail.ts
