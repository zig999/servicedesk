---
type: invariant
statement: A read naming a stored case version for which some validator rule of validation-runs-at-every-read does not hold at that reading is refused with an HTTP 409 response reporting a CaseVersionNotValidError; it is never answered with the generic refusal a domain error the status map does not name receives, and never with the CaseNotFoundError that answers a slug or version no case version was ever written for.
constrains:
  - domain/knowledge/case-version
---

## Description

`validation-runs-at-every-read` makes this a standing state of the store rather than an edge of it: a stored version, draft or released, is read as a case only while every validator rule holds at that reading, and no field marks one that currently fails a rule. A caller may therefore name a slug and a version that a stored case version answers and still get no case back, and this states what that read answers.

It is named rather than left to the fallback. `constraints/a-domain-error-unmapped-by-status-is-refused-generically` exists for what the system did not anticipate and deliberately discloses nothing about it; this condition is anticipated by `validation-runs-at-every-read` itself, so answering it with that fixed, uninformative text would leave the caller unable to tell a version somebody must correct from a failure somebody must retry. `a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case` already owes its reader exactly that distinction, and a surface can only state what the read it made told it.

It is also held apart from its two neighbours in the same family. `a-case-read-by-an-unknown-slug-or-version-is-refused` answers a slug, or a slug and version, that no case version currently answers — a version never written — and `a-case-holding-no-versions-is-told-explicitly` answers a case that exists and holds no version at all. Here the case is there and the version is there; validation is what declines to read it back as a case.

The status is the one this specification already gives an operation the target's own current state forbids, as `only-a-released-case-version-is-diagnosed` and `a-case-has-at-most-one-draft` give it: the request is well formed and the resource it names exists, and what refuses it is the state of the stored version at that moment. The 422 of `a-release-refusal-with-no-named-violation-says-so` answers a well-formed write whose result would violate an invariant, and no write is attempted here.

Nothing partial accompanies the refusal, because `a-case-is-read-whole` answers a complete, validated version or nothing at all. A replay is untouched: it reads its pinned version without revalidation, so no reading of that kind reaches this refusal.
