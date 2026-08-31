---
title: Carry the malformed-input-schema capabilities on the subject state
summary: The capability identities the read names apart from its requirements, carried through the state
  the Subject region is passed.
rationale: Cut apart from the disclosure that renders it because the state gaining these identities and
  the panel reading them are one interface and its consumer, and apart from the field derivation because
  a capability that asks for nothing is a different outcome from a field that asks for something.
sources:
- work/case-simulation-input-requirements/intake/scope.md
objective: The subject state carries, apart from its field set, the name and version of every capability
  the input-requirements read names as holding no well-formed input schema.
criteria:
- Every capability the read names apart from its requirements is carried on the subject state by its own
  name and version.
- No such capability appears among the state's exposed fields or in any field's own capability annotation.
- A read naming no such capability leaves that list empty rather than absent.
depends_on:
- task/subject-input-requirements/read-case-input-requirements-hook
implements:
- contracts/knowledge/case-input-requirements
- domain/knowledge/case-input-requirement
- domain/integration/capability
- rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability
---

## What it is
The second half of the read, carried to the region that composes the subject rather than dropped at the hook boundary.
It sits beside the field set on the same state, never inside it, because the read itself names these capabilities apart from every requirement.

## Notes
rules/knowledge/a-case-versions-input-requirements-are-derived states that such a capability never appears among any entry's own capabilities, which is what the second criterion holds the state to.
UNDERDETERMINED, from the specification -- rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability keys the disclosure to what the pinned case version's own case-input-requirements read names apart from its requirements; a passing implementation must derive this list from that read alone, never from a second, client-side inspection of each resolved capability's own stored input schema, even where the two would usually agree.
REMAINDER, from the specification -- rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability's own disclosure clause (showing the identity to the person composing the subject) reaches no criterion of this task, which only carries the list on state and shows it to nobody.
Belongs: the sibling task that renders the Subject region from this state.
Advisory: criterion 2's exclusion from "any field's own capability annotation" constrains a per-field annotation this task does not build; the exclusion itself is backed by domain/knowledge/case-input-requirement (such a capability is referenced by none), but the criterion is falsifiable only once the annotation and the field set it hangs on exist.
Advisory: the list this task carries exists only because contracts/knowledge/case-input-requirements states the read names these capabilities apart from the attributes; this task implements no part of that read itself, so its criteria are demonstrable only where the read already answers that separate naming.
