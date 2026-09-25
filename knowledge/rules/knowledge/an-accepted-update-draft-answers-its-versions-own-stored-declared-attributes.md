---
type: invariant
statement: >-
  An update-draft accepted over a draft case version is answered with HTTP 200 carrying
  that version's title, when_to_use, subject, fallback and consolidation_register exactly
  as that version's own stored record holds them once the write has settled and carrying
  no entry of its manifest, read from that record and never through
  contracts/knowledge/case-query's whole-case read, so that it is never answered with a
  CaseVersionNotValidError because some validator rule of validation-runs-at-every-read
  does not hold for that version.
expression: >-
  For a draft case version v and an update-draft over v that is accepted: the answer
  carries HTTP 200. Its body carries v's title, v's when_to_use, v's subject, v's
  fallback (its outcome and its referral) and v's consolidation_register, each as v's own
  stored record holds it once the write that update-draft made has settled; where v's
  stored record holds no consolidation_register, the answer carries none, and no other
  version's register or consolidation adapter's default stands in its place. The answer
  carries no entry of v's manifest. None of it is read through
  contracts/knowledge/case-query's whole-case assembly: whether every validator rule of
  validation-runs-at-every-read holds for v at that moment changes nothing here, and an
  accepted update-draft is never answered with a CaseVersionNotValidError, whichever rule
  is failing, v's own declared attributes included.
constrains:
  - domain/knowledge/case-version
---

## Description

`an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case` keeps update-draft accepted on a reading where the draft does not read back as a case, and `a-case-with-no-hypothesis-is-still-open-for-editing` has the curator correct a title on exactly that reading. This states what that accepted call answers.

The status is 200. update-draft corrects the declared attributes of a version that already stands, which is the freedom `domain/knowledge/case-version` keeps while draft state holds, and it brings no version into existence. 201 would claim a creation that did not happen, and 204 could carry none of the attributes the answer holds.

The answer carries the version's own stored attributes as the write left them. On this reading the whole-case read refuses the version, so the answer is the only place the curator learns what now stands. An answer read through that read would report a CaseVersionNotValidError for a write that did land, and the curator would see an accepted correction as a refused one.

The manifest stays outside the answer. update-draft writes none of it, the editing surface presents none of it, and what a manifest surface presents is decided elsewhere.

What a refused update-draft is answered with stays with the rules that name each refusal.
