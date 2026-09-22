---
type: policy
statement: >-
  A write creating a case version under a case slug and version number some stored case
  version already answers stores no second version and alters the stored one in no way,
  and is refused by a name of its own — a CaseVersionAlreadyStoredError, never the
  CaseNotFoundError that answers a slug or version no case version was ever written for
  and never the validation refusal a malformed request receives — whose message names
  that slug and that version number.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
consistency: eventual
---

## Description

The pin is the whole of a case version's identity — a slug and a number, with no digest over the content — so a creation arriving at a pin some stored version already answers can be absorbed in no way: keeping both would leave two contents having answered one pin, and letting the arriving one land would move content an investigation may already have pinned.

Each of the answers it might otherwise meet states something untrue. The generic refusal a domain error the status map does not name receives tells the curator nothing at all about what happened. `a-case-read-by-an-unknown-slug-or-version-is-refused`'s CaseNotFoundError says the named pin answers no version, while here it is precisely a stored version that stood in the way. `constraints/a-malformed-request-is-refused-with-a-validation-error` reports a shape the route declared and the request broke, while such a request is well formed and the conflict is in the store. Only a refusal of its own leaves the curator able to tell a pin nothing occupies from one already taken.

Correcting a draft is not this rule's business. update-draft writes into the version already standing at that pin rather than bringing a second one into existence — the freedom `domain/knowledge/case-version` keeps over a draft's own declared attributes for as long as draft state holds — and nothing here narrows it.

Neither standing rule answers this arrival. `a-case-version-is-written-once` holds a released version and its manifest entries unaltered, and `a-case-version-number-is-never-reused` keeps a number the case has spent from being issued a second time; both say how pins are handed out, and neither says what a write that reaches one already occupied is told — which is what a create-draft racing another on one number arrives at, and what `contracts/knowledge/case-lifecycle` already reads as a release naming a slug and version that already exist being refused rather than merged.

The slug and the number are in the message because they are the only things that tell the curator which write lost, and against which case — the same disclosure `a-case-read-by-an-unknown-slug-or-version-is-refused` and `a-case-version-moves-through-its-declared-lifecycle` already make of the pin their own refusals name.

Consistency is eventual: the pin spans the case identity that holds the slug and the case version that holds the number, each read as an aggregate root of its own.
