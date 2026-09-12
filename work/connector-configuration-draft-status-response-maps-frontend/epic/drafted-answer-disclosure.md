---
title: What the Configuration Helper states about a draft request and its answer
summary: The Helper's side of the change -- the grown answer reaching the surface, the status readings,
  response fields, reading notes and unresolved reasons stated over it, the gate on requesting one, the
  operations-read states, the staleness marking, and the apply confirmation's itemisation.
rationale: Cut apart from the readiness work because everything here is answered by one backend read and
  changes when that answer changes, while the readiness statements are made over the Configuration field's
  own text and change when the registry's or the HTTP connector's criteria change.
covers:
- contracts/integration/connector-configuration-draft
- domain/integration/connector-configuration-draft
- domain/integration/connector-configuration-draft-status-reading
- domain/integration/connector-configuration-draft-response-field
- domain/integration/connector-configuration-draft-reading-note
- domain/integration/connector-configuration-draft-reading-note-kind
- domain/integration/connector-configuration-draft-unresolved-item
- domain/integration/connector-configuration-draft-unresolved-reason
- domain/integration/openapi-document-operations
- rules/integration/an-answered-draft-request-states-its-draft-to-the-operator
- rules/integration/a-connector-configuration-draft-response-carries-no-capability
- rules/integration/a-draft-request-is-offered-only-over-a-named-connector-and-a-chosen-operation
- rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing
- rules/integration/the-configuration-helper-states-an-operations-read-outstanding-and-a-document-declaring-no-operation
- rules/integration/a-stated-draft-is-marked-stale-once-what-it-was-generated-for-changes
- rules/integration/an-apply-confirmation-states-what-the-draft-would-change
- rules/integration/a-connector-configuration-drafts-configuration-is-well-formed-object-text
- rules/integration/an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation
- constraints/the-openapi-document-is-fetched-by-the-backend
- scenarios/integration/an-answered-draft-is-stated-with-its-readings-and-its-notes
- scenarios/integration/applying-a-draft-over-an-unsaved-edit-asks-for-confirmation
- rules/integration/a-connector-configuration-draft-registers-nothing
uncovered:
- node: rules/integration/a-connector-configuration-draft-registers-nothing
  why: The Helper issues no register-connector call today and this plan adds no act to it that would;
    nothing here rewrites that behaviour.
- node: scenarios/integration/applying-a-draft-over-an-unsaved-edit-asks-for-confirmation
  why: Its first then clause -- that the surface asks the operator to confirm before replacing the
    field's content -- names the confirmation gate itself, which the inventory already finds standing
    on this surface today (an Apply-over-unsaved-edit confirmation dialog, currently a fixed
    description); this plan's apply-confirmation-diff task only grows what that existing dialog
    states, and no task here rebuilds the gate.
sources:
- intake/scope.md
---

## What it is
The Configuration Helper's whole surface: requesting a draft, reading the answer, and stating every part that answer carries.
It holds the three parts the answer now carries that the frontend's own allow-list currently discards, and the reasons and kinds those parts are stated apart by.
It also holds the three things the scope names around the draft rather than inside it -- the gate on requesting one, the marking of a draft the surface has moved away from, and the itemisation the confirmation before an apply owes.

## Notes
The refusal readings of the draft request and of the operations read already stand distinguishably on this surface, so no task is cut for them; what this plan changes about them is their wording, which the rules that hold them leave to the interface.
The generated-credential and method-mismatch sections already stand as well, and are touched here only in wording.
The post-registration next-steps guidance the scope sketches in its section 6.6 reaches no node of this specification, so no task in this plan states it.
