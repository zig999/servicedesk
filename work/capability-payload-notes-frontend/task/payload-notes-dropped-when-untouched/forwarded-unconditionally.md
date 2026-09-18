---
title: An untouched, previously-declared payload_notes is forwarded on resubmission
summary: Both capability form hooks forward payload_notes from the form's current value unconditionally,
  the same as every other declared attribute, instead of only when the operator dirtied it this session.
sources:
- work/capability-payload-notes-frontend/intake/payload-notes-dropped-when-untouched.md
objective: A capability resubmitted through either form hook carries forward whatever payload_notes value
  the form currently holds, whether or not the operator edited that field in this session, the same as
  every other declared attribute already does.
criteria:
- A capability loaded with existing payload_notes, resubmitted through use-capability-detail after editing
  only an unrelated field, is submitted with payload_notes carrying that same existing text.
- A capability loaded with existing payload_notes, resubmitted through use-capability-form after editing
  only an unrelated field, is submitted with payload_notes carrying that same existing text.
- An operator who explicitly clears payload_notes and resubmits through either hook still submits payload_notes
  as an empty string, not the prior text.
- An operator who explicitly types new payload_notes and resubmits through either hook still submits the
  newly typed text.
implements:
- domain/integration/capability
---
## What it is

Both hooks' PUT bodies now forward `values.payload_notes` unconditionally, dropping the
dirtyFields gate, the same as every other declared attribute already does.

## Notes

ADVISORY, from the specification -- domain/integration/capability speaks only in general terms of payload_notes as a declared attribute an operator supplies; it says nothing specifically about resubmission or about a value surviving an editing session. This task's distinction between a value the operator dirtied this session and one loaded from the read rests on that general declaration alone.
